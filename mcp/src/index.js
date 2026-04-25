import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';

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
      name: 'validate_openspec',
      description:
        'Validates an OpenSpec spec.md file (or all spec.md files in an openspec/specs/ directory). ' +
        'Checks that each spec file follows the OpenSpec format: ' +
        '## Purpose section, at least one ### Requirement: heading, ' +
        'and at least one #### Scenario: with GIVEN/WHEN/THEN lines.',
      inputSchema: {
        type: 'object',
        properties: {
          specPath: {
            type: 'string',
            description:
              'Path to a single spec.md file OR to the openspec/specs/ directory to validate all specs.',
          },
        },
        required: ['specPath'],
      },
    },
    {
      name: 'list_acceptance_criteria',
      description:
        'Extracts and lists all Given/When/Then acceptance criteria from a requirements document ' +
        'or an OpenSpec spec.md file.',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description:
              'Absolute or relative path to a requirements Markdown file or an OpenSpec spec.md.',
          },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'verify_spec_coverage',
      description:
        'Checks whether the OpenSpec specs in openspec/specs/ cover all use cases (CU) and ' +
        'business rules (RN) found in a requirements document. ' +
        'Returns covered and uncovered items.',
      inputSchema: {
        type: 'object',
        properties: {
          specsDir: {
            type: 'string',
            description:
              'Path to the openspec/specs/ directory containing domain spec.md files.',
          },
          requirementsPath: {
            type: 'string',
            description: 'Absolute or relative path to the requirements Markdown file.',
          },
        },
        required: ['specsDir', 'requirementsPath'],
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

    case 'validate_openspec': {
      const target = path.resolve(args.specPath);
      if (!fs.existsSync(target)) {
        return errorResult(`Path not found: ${target}`);
      }

      const stat = fs.statSync(target);
      const specFiles = stat.isDirectory()
        ? collectSpecFiles(target)
        : [target];

      if (specFiles.length === 0) {
        return errorResult(`No spec.md files found under: ${target}`);
      }

      const results = specFiles.map((f) => validateOpenspecFile(f));
      const passed = results.filter((r) => r.valid).length;
      const failed = results.filter((r) => !r.valid).length;

      const lines = [
        `📋 OpenSpec validation — ${specFiles.length} spec(s) checked`,
        `✅ Valid: ${passed}   ❌ Invalid: ${failed}`,
        '',
        ...results.map((r) => {
          const rel = path.relative(process.cwd(), r.file);
          if (r.valid) {
            return `✅ ${rel}\n   Requirements: ${r.requirementCount}  Scenarios: ${r.scenarioCount}`;
          }
          return `❌ ${rel}\n${r.errors.map((e) => `   • ${e}`).join('\n')}`;
        }),
      ];
      return textResult(lines.join('\n'));
    }

    case 'list_acceptance_criteria': {
      const filePath = path.resolve(args.filePath);
      if (!fs.existsSync(filePath)) {
        return errorResult(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const criteria = extractScenarios(content);
      if (criteria.length === 0) {
        return textResult('No se encontraron escenarios Given/When/Then en el archivo.');
      }
      const lines = criteria.map((s) => {
        const steps = s.steps.map((step) => `      ${step}`).join('\n');
        return `${s.parent} › ${s.scenario}:\n${steps}`;
      });
      return textResult(lines.join('\n\n'));
    }

    case 'verify_spec_coverage': {
      const specsDir = path.resolve(args.specsDir);
      const reqPath = path.resolve(args.requirementsPath);

      if (!fs.existsSync(specsDir)) {
        return errorResult(`Specs directory not found: ${specsDir}`);
      }
      if (!fs.existsSync(reqPath)) {
        return errorResult(`Requirements file not found: ${reqPath}`);
      }

      const specFiles = collectSpecFiles(specsDir);
      const allSpecsText = specFiles
        .map((f) => fs.readFileSync(f, 'utf-8'))
        .join('\n')
        .toLowerCase();

      const requirements = fs.readFileSync(reqPath, 'utf-8');
      const coverage = checkCoverage(allSpecsText, requirements, specFiles);

      const lines = [
        `📋 Casos de uso en requerimientos: ${coverage.useCases.length}`,
        `✅ Cubiertos por los specs: ${coverage.covered.length}`,
        `❌ Sin cobertura detectada: ${coverage.missing.length}`,
        '',
        '── Detalle de casos de uso ─────────────────────',
        ...coverage.useCases.map((uc) => {
          const isCovered = coverage.covered.includes(uc.id);
          return `${isCovered ? '✅' : '❌'} ${uc.id}: ${uc.description}`;
        }),
        '',
        `📌 Reglas de negocio: ${coverage.businessRules.length}`,
        ...coverage.businessRules.map((rn) => {
          const isCovered = allSpecsText.includes(rn.id.toLowerCase());
          return `${isCovered ? '✅' : '❌'} ${rn.id}: ${rn.description}`;
        }),
        '',
        `📂 Spec files analizados: ${specFiles.length}`,
        ...specFiles.map((f) => `  ${path.relative(process.cwd(), f)}`),
      ];
      return textResult(lines.join('\n'));
    }

    default:
      return errorResult(`Unknown tool: ${name}`);
  }
});

// ─── OpenSpec Validators ─────────────────────────────────────────────────────

/**
 * Recursively collect all spec.md files under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectSpecFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSpecFiles(full));
    } else if (entry.isFile() && entry.name === 'spec.md') {
      results.push(full);
    }
  }
  return results;
}

/**
 * Validates a single OpenSpec spec.md file.
 * Required:
 *  - ## Purpose section
 *  - At least one ### Requirement: heading
 *  - At least one #### Scenario: with GIVEN/WHEN/THEN
 * @param {string} filePath
 * @returns {{ file, valid, errors, requirementCount, scenarioCount }}
 */
function validateOpenspecFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];

  const hasPurpose = /^## Purpose/m.test(content);
  const requirementMatches = content.match(/^### Requirement:/gm) || [];
  const scenarioMatches = content.match(/^#### Scenario:/gm) || [];

  const givenLines = content.match(/^- GIVEN /gm) || [];
  const whenLines = content.match(/^- WHEN /gm) || [];
  const thenLines = content.match(/^- THEN /gm) || [];

  if (!hasPurpose) errors.push('Missing "## Purpose" section');
  if (requirementMatches.length === 0) errors.push('No "### Requirement:" heading found');
  if (scenarioMatches.length === 0) errors.push('No "#### Scenario:" heading found');
  if (givenLines.length === 0) errors.push('No "- GIVEN" lines found');
  if (whenLines.length === 0) errors.push('No "- WHEN" lines found');
  if (thenLines.length === 0) errors.push('No "- THEN" lines found');

  return {
    file: filePath,
    valid: errors.length === 0,
    errors,
    requirementCount: requirementMatches.length,
    scenarioCount: scenarioMatches.length,
  };
}

/**
 * Extracts GIVEN/WHEN/THEN scenarios from a Markdown file (requirements or OpenSpec).
 * @param {string} content
 * @returns {{ parent: string, scenario: string, steps: string[] }[]}
 */
function extractScenarios(content) {
  const results = [];

  // Split by Scenario headings (#### Scenario: or ### CU headings with CA blocks)
  const sections = content.split(/\n(?=#{1,4}\s)/);

  let currentParent = '';

  for (const section of sections) {
    // Track parent heading (## or ### level)
    const parentMatch = section.match(/^#{2,3}\s+(.+)/);
    if (parentMatch) {
      currentParent = parentMatch[1].trim();
    }

    // OpenSpec format: #### Scenario: <name>
    const openspecScenario = section.match(/^#### Scenario:\s*(.+)/);
    if (openspecScenario) {
      const steps = extractGivenWhenThen(section);
      if (steps.length > 0) {
        results.push({
          parent: currentParent,
          scenario: openspecScenario[1].trim(),
          steps,
        });
      }
      continue;
    }

    // Requirements doc format: - **CAn** with Given/When/Then
    const caPattern = /- \*\*(CA\d+)\*\*\s*\n((?:\s+- \*\*(?:Given|When|Then):\*\*[^\n]+\n?)+)/g;
    let m;
    while ((m = caPattern.exec(section)) !== null) {
      const steps = m[2]
        .split('\n')
        .map((l) => l.replace(/^\s+- \*\*/, '').replace(/\*\*/, ':').trim())
        .filter(Boolean);
      results.push({
        parent: currentParent,
        scenario: m[1],
        steps,
      });
    }
  }

  return results;
}

/**
 * Extracts - GIVEN / - WHEN / - THEN / - AND lines from a section.
 * @param {string} section
 * @returns {string[]}
 */
function extractGivenWhenThen(section) {
  return section
    .split('\n')
    .filter((l) => /^\s*- (GIVEN|WHEN|THEN|AND) /.test(l))
    .map((l) => l.trim());
}

/**
 * Checks CU and RN coverage of requirements against the combined spec text.
 * @param {string} allSpecsText - lowercased concatenated text of all spec files
 * @param {string} requirements - requirements Markdown text
 * @param {string[]} specFiles - list of spec file paths
 */
function checkCoverage(allSpecsText, requirements, specFiles) {
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

  const businessRules = [];
  const rnPattern = /\*\*(RN\d+):\*\*\s*([^\n]+)/g;
  const seenRns = new Set();
  while ((m = rnPattern.exec(requirements)) !== null) {
    if (!seenRns.has(m[1])) {
      seenRns.add(m[1]);
      businessRules.push({ id: m[1], description: m[2].trim().replace(/\*\*/g, '') });
    }
  }

  const covered = useCases
    .filter((uc) => allSpecsText.includes(uc.id.toLowerCase()))
    .map((uc) => uc.id);
  const missing = useCases
    .filter((uc) => !allSpecsText.includes(uc.id.toLowerCase()))
    .map((uc) => uc.id);

  return { useCases, businessRules, covered, missing };
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
