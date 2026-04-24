import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import SwaggerParser from '@apidevtools/swagger-parser';

const server = new Server(
  { name: 'spec-runner-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ─── Tool definitions ────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'load_requirements',
      description:
        'Loads and returns the full content of a requirements Markdown document.',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Absolute or relative path to the requirements Markdown file.',
          },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'validate_openapi_spec',
      description:
        'Validates an OpenAPI 3.x YAML or JSON spec file against the OpenAPI standard. ' +
        'Returns a summary of valid endpoints and schemas, or detailed error messages.',
      inputSchema: {
        type: 'object',
        properties: {
          specPath: {
            type: 'string',
            description: 'Absolute or relative path to the OpenAPI spec file (.yaml or .json).',
          },
        },
        required: ['specPath'],
      },
    },
    {
      name: 'list_acceptance_criteria',
      description:
        'Extracts and lists all Given/When/Then acceptance criteria from a requirements document.',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Absolute or relative path to the requirements Markdown file.',
          },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'verify_spec_coverage',
      description:
        'Checks whether an OpenAPI spec covers all use cases (CU) and business rules (RN) ' +
        'found in a requirements document. Returns covered and uncovered items.',
      inputSchema: {
        type: 'object',
        properties: {
          specPath: {
            type: 'string',
            description: 'Absolute or relative path to the OpenAPI spec file.',
          },
          requirementsPath: {
            type: 'string',
            description: 'Absolute or relative path to the requirements Markdown file.',
          },
        },
        required: ['specPath', 'requirementsPath'],
      },
    },
  ],
}));

// ─── Tool handlers ───────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'load_requirements': {
      const filePath = path.resolve(args.filePath);
      if (!fs.existsSync(filePath)) {
        return errorResult(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return textResult(content);
    }

    case 'validate_openapi_spec': {
      const specPath = path.resolve(args.specPath);
      if (!fs.existsSync(specPath)) {
        return errorResult(`Spec file not found: ${specPath}`);
      }
      try {
        const api = await SwaggerParser.validate(specPath);
        const pathCount = Object.keys(api.paths || {}).length;
        const schemaCount = Object.keys(
          (api.components && api.components.schemas) || {}
        ).length;
        const tagNames = (api.tags || []).map((t) => t.name).join(', ');
        const summary = [
          `✅ Spec válida: ${api.info.title} v${api.info.version}`,
          `   OpenAPI: ${api.openapi}`,
          `   Endpoints (paths): ${pathCount}`,
          `   Schemas: ${schemaCount}`,
          `   Tags: ${tagNames || '(ninguno)'}`,
        ].join('\n');
        return textResult(summary);
      } catch (err) {
        return errorResult(`❌ Spec inválida:\n${err.message}`);
      }
    }

    case 'list_acceptance_criteria': {
      const filePath = path.resolve(args.filePath);
      if (!fs.existsSync(filePath)) {
        return errorResult(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const criteria = extractAcceptanceCriteria(content);
      if (criteria.length === 0) {
        return textResult('No se encontraron criterios de aceptación en el documento.');
      }
      const lines = criteria.map((c) => {
        const casList = c.criteria
          .map(
            (ca) =>
              `    ${ca.id}:\n` +
              `      Given: ${ca.given}\n` +
              `      When:  ${ca.when}\n` +
              `      Then:  ${ca.then}`
          )
          .join('\n');
        return `${c.useCase}:\n${casList}`;
      });
      return textResult(lines.join('\n\n'));
    }

    case 'verify_spec_coverage': {
      const specPath = path.resolve(args.specPath);
      const reqPath = path.resolve(args.requirementsPath);

      if (!fs.existsSync(specPath)) {
        return errorResult(`Spec file not found: ${specPath}`);
      }
      if (!fs.existsSync(reqPath)) {
        return errorResult(`Requirements file not found: ${reqPath}`);
      }

      let spec;
      try {
        spec = yaml.load(fs.readFileSync(specPath, 'utf-8'));
      } catch (err) {
        return errorResult(`Failed to parse spec: ${err.message}`);
      }
      const requirements = fs.readFileSync(reqPath, 'utf-8');

      const coverage = checkCoverage(spec, requirements);
      const lines = [
        `📋 Casos de uso en requerimientos: ${coverage.useCases.length}`,
        `✅ Cubiertos por el spec: ${coverage.covered.length}`,
        `❌ Sin cobertura detectada: ${coverage.missing.length}`,
        '',
        '── Detalle ──────────────────────────────────────',
        ...coverage.useCases.map((uc) => {
          const isCovered = coverage.covered.includes(uc.id);
          return `${isCovered ? '✅' : '❌'} ${uc.id}: ${uc.description}`;
        }),
        '',
        `📌 Reglas de negocio encontradas: ${coverage.businessRules.length}`,
        ...coverage.businessRules.map((rn) => `  ${rn.id}: ${rn.description}`),
        '',
        `🛣  Endpoints en el spec: ${coverage.paths.length}`,
        ...coverage.paths.map((p) => `  ${p}`),
      ];
      return textResult(lines.join('\n'));
    }

    default:
      return errorResult(`Unknown tool: ${name}`);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts Given/When/Then acceptance criteria grouped by use case from a Markdown document.
 * @param {string} content - Markdown text
 * @returns {{ useCase: string, criteria: { id: string, given: string, when: string, then: string }[] }[]}
 */
function extractAcceptanceCriteria(content) {
  const result = [];
  // Split by ### headings that look like use case sections (e.g., ### CU1: ...)
  const sections = content.split(/\n(?=###\s+CU\d+)/);

  for (const section of sections) {
    const useCaseMatch = section.match(/###\s+(CU\d+[^(\n]*)/);
    if (!useCaseMatch) continue;

    const useCaseTitle = useCaseMatch[1].trim();
    const criteria = [];

    // Match CA blocks: - **CAn** followed by Given/When/Then
    const caPattern =
      /- \*\*(CA\d+)\*\*\s*\n\s+- \*\*Given:\*\*\s*([^\n]+)\n\s+- \*\*When:\*\*\s*([^\n]+)\n\s+- \*\*Then:\*\*\s*([^\n]+)/g;

    let match;
    while ((match = caPattern.exec(section)) !== null) {
      criteria.push({
        id: match[1],
        given: match[2].trim(),
        when: match[3].trim(),
        then: match[4].trim(),
      });
    }

    if (criteria.length > 0) {
      result.push({ useCase: useCaseTitle, criteria });
    }
  }
  return result;
}

/**
 * Checks coverage of use cases and business rules from requirements against an OpenAPI spec.
 * @param {object} spec - Parsed OpenAPI spec object
 * @param {string} requirements - Requirements Markdown text
 * @returns {{ useCases, businessRules, paths, covered, missing }}
 */
function checkCoverage(spec, requirements) {
  // Extract use cases: **CU1:** description or - **CU1:** description
  const useCases = [];
  const cuPattern = /\*\*(CU\d+):\*\*\s*([^\n(*]+)/g;
  const seenIds = new Set();
  let m;
  while ((m = cuPattern.exec(requirements)) !== null) {
    if (!seenIds.has(m[1])) {
      seenIds.add(m[1]);
      useCases.push({ id: m[1], description: m[2].trim().replace(/\*\*/g, '') });
    }
  }

  // Extract business rules: **RN1:** description
  const businessRules = [];
  const rnPattern = /\*\*(RN\d+):\*\*\s*([^\n]+)/g;
  const seenRns = new Set();
  while ((m = rnPattern.exec(requirements)) !== null) {
    if (!seenRns.has(m[1])) {
      seenRns.add(m[1]);
      businessRules.push({ id: m[1], description: m[2].trim().replace(/\*\*/g, '') });
    }
  }

  const paths = Object.keys(spec.paths || {});

  // Build a searchable string from all spec descriptions and summaries
  const specText = JSON.stringify(spec).toLowerCase();

  const covered = [];
  const missing = [];

  for (const uc of useCases) {
    // A use case is considered covered if its ID (e.g. "CU1") appears in the spec text
    if (specText.includes(uc.id.toLowerCase())) {
      covered.push(uc.id);
    } else {
      missing.push(uc.id);
    }
  }

  return { useCases, businessRules, paths, covered, missing };
}

// ─── Result builders ─────────────────────────────────────────────────────────

function textResult(text) {
  return { content: [{ type: 'text', text }] };
}

function errorResult(message) {
  return { content: [{ type: 'text', text: message }], isError: true };
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
