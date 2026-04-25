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
        'Checks whether the OpenSpec specs in openspec/specs/ cover all requirements found in a ' +
        'document. Works with any labeled requirement format (CU, US, REQ, FR, etc.) and ' +
        'categorizes items as functional requirements, business rules, and NFRs. ' +
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
    {
      name: 'detect_gaps',
      description:
        'Analyzes a requirements or design document to identify gaps: unanswered questions, ' +
        'requirements without acceptance criteria, ambiguous terms, TODO/TBD markers, ' +
        'and missing standard sections (Actors, Use Cases, Business Rules, NFRs, Acceptance Criteria). ' +
        'Works with any Markdown requirements document regardless of labeling convention.',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Absolute or relative path to the requirements or design Markdown file.',
          },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'suggest_clarifications',
      description:
        'Generates specific, actionable clarification questions for a requirements or design document, ' +
        'targeting each detected gap, ambiguous definition, and missing information item. ' +
        'Use this to guide the author in completing and improving the specification. ' +
        'Works with any Markdown requirements document.',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Absolute or relative path to the requirements or design Markdown file.',
          },
        },
        required: ['filePath'],
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

      const outputLines = [
        `📋 Requerimientos funcionales encontrados: ${coverage.funcRequirements.length}`,
        `✅ Cubiertos por los specs: ${coverage.covered.length}`,
        `❌ Sin cobertura detectada: ${coverage.missing.length}`,
        '',
        '── Requerimientos funcionales ──────────────────────',
        ...coverage.funcRequirements.map((item) => {
          const isCovered = coverage.covered.includes(item.id);
          return `${isCovered ? '✅' : '❌'} ${item.id}: ${item.description}`;
        }),
      ];

      if (coverage.businessRules.length > 0) {
        outputLines.push('');
        outputLines.push(`📌 Reglas de negocio: ${coverage.businessRules.length}`);
        coverage.businessRules.forEach((rn) => {
          const isCovered = allSpecsText.includes(rn.id.toLowerCase());
          outputLines.push(`${isCovered ? '✅' : '❌'} ${rn.id}: ${rn.description}`);
        });
      }

      if (coverage.nfrItems.length > 0) {
        outputLines.push('');
        outputLines.push(`⚙️  Requerimientos no funcionales: ${coverage.nfrItems.length}`);
        coverage.nfrItems.forEach((nfr) => {
          const isCovered = allSpecsText.includes(nfr.id.toLowerCase());
          outputLines.push(`${isCovered ? '✅' : '❌'} ${nfr.id}: ${nfr.description}`);
        });
      }

      outputLines.push('');
      outputLines.push(`📂 Spec files analizados: ${specFiles.length}`);
      specFiles.forEach((f) => outputLines.push(`  ${path.relative(process.cwd(), f)}`));

      return textResult(outputLines.join('\n'));
    }

    case 'detect_gaps': {
      const filePath = path.resolve(args.filePath);
      if (!fs.existsSync(filePath)) {
        return errorResult(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const gaps = analyzeGaps(content);
      const rel = path.relative(process.cwd(), filePath);
      const totalIssues =
        gaps.openQuestions.length +
        gaps.ambiguousTerms.length +
        gaps.todoMarkers.length +
        gaps.missingCriteria.length +
        gaps.missingSections.length;

      const gapOutputLines = [
        `🔎 Análisis de gaps — ${rel}`,
        `   Problemas detectados: ${totalIssues}`,
        '',
      ];
      if (gaps.missingSections.length > 0) {
        gapOutputLines.push(`📋 Secciones estándar ausentes (${gaps.missingSections.length}):`);
        gaps.missingSections.forEach((s) => gapOutputLines.push(`   • ${s}`));
        gapOutputLines.push('');
      }
      if (gaps.openQuestions.length > 0) {
        gapOutputLines.push(`❓ Preguntas sin respuesta (${gaps.openQuestions.length}):`);
        gaps.openQuestions.slice(0, 10).forEach((q) =>
          gapOutputLines.push(`   • Línea ${q.line}: ${q.text.substring(0, 100)}`)
        );
        if (gaps.openQuestions.length > 10)
          gapOutputLines.push(`   ... y ${gaps.openQuestions.length - 10} más`);
        gapOutputLines.push('');
      }
      if (gaps.missingCriteria.length > 0) {
        gapOutputLines.push(
          `🎯 Requerimientos sin criterios de aceptación (${gaps.missingCriteria.length}):`
        );
        gaps.missingCriteria.forEach((item) =>
          gapOutputLines.push(`   • ${item.id}: ${item.description.substring(0, 80)}`)
        );
        gapOutputLines.push('');
      }
      if (gaps.todoMarkers.length > 0) {
        gapOutputLines.push(`⏳ Marcadores pendientes / TBD (${gaps.todoMarkers.length}):`);
        gaps.todoMarkers.slice(0, 10).forEach((t) =>
          gapOutputLines.push(`   • Línea ${t.line}: ${t.text.substring(0, 100)}`)
        );
        if (gaps.todoMarkers.length > 10)
          gapOutputLines.push(`   ... y ${gaps.todoMarkers.length - 10} más`);
        gapOutputLines.push('');
      }
      if (gaps.ambiguousTerms.length > 0) {
        gapOutputLines.push(
          `🔍 Términos ambiguos detectados (${gaps.ambiguousTerms.length} ocurrencias):`
        );
        gaps.ambiguousTerms.slice(0, 10).forEach((a) =>
          gapOutputLines.push(`   • "${a.term}" en línea ${a.line}: ${a.text.substring(0, 80)}`)
        );
        if (gaps.ambiguousTerms.length > 10)
          gapOutputLines.push(`   ... y ${gaps.ambiguousTerms.length - 10} más`);
        gapOutputLines.push('');
      }
      if (totalIssues === 0) {
        gapOutputLines.push(
          '✅ No se detectaron gaps evidentes. El documento parece estar completo.'
        );
      }
      return textResult(gapOutputLines.join('\n'));
    }

    case 'suggest_clarifications': {
      const filePath = path.resolve(args.filePath);
      if (!fs.existsSync(filePath)) {
        return errorResult(`File not found: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const gaps = analyzeGaps(content);
      const questions = generateClarifications(gaps);
      const rel = path.relative(process.cwd(), filePath);

      if (questions.length === 0) {
        return textResult(
          `✅ No se encontraron gaps significativos en "${rel}".\n` +
            'El documento parece estar suficientemente completo para generar especificaciones.'
        );
      }
      const clarOutputLines = [
        `💬 Preguntas de clarificación para: ${rel}`,
        `   ${questions.length} pregunta(s) generada(s)`,
        '',
        ...questions.map((q, i) => `${i + 1}. ${q}`),
        '',
        'Responde estas preguntas para completar la especificación antes de generar los specs OpenSpec.',
      ];
      return textResult(clarOutputLines.join('\n'));
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
 * Extracts labeled requirements of any type from a Markdown document.
 * Supports formats: **CU1:**, **RN-1:**, ## 1.1 RNF1:, - US001: description, etc.
 * @param {string} text
 * @returns {{ id: string, description: string }[]}
 */
function extractLabeledItems(text) {
  const items = [];
  const seen = new Set();

  const addItem = (id, description) => {
    const normId = id.toUpperCase().replace(/[-_]/g, '');
    if (!seen.has(normId)) {
      seen.add(normId);
      items.push({
        id: id.toUpperCase(),
        description: description.trim().replace(/\*\*/g, '').replace(/\s*\([^)]*\)\s*/g, ' ').trim(),
      });
    }
  };

  // Pattern 1: **LABEL:** description — bold label with colon (most common in Spanish req docs)
  // Handles: **CU1:**, **RN-1:**, **RNF1:**, **US001:**, **REQ-001:**
  const boldColonPattern = /\*\*([A-Z]{1,5}[-_]?\d+(?:\.\d+)?):\*\*\s*([^\n*]+)/g;
  let m;
  while ((m = boldColonPattern.exec(text)) !== null) {
    addItem(m[1], m[2]);
  }

  // Pattern 2: heading ## Nn.Nn LABEL: description or ### LABEL: description
  // Handles: ## 1.1 RNF1: Autenticación, ### CU1: Solicitar hora
  const headingPattern = /^#{1,4}\s+(?:\d+(?:\.\d+)*\s+)?([A-Z]{1,5}[-_]?\d+(?:\.\d+)?)[:\s]+([^\n#]+)/gm;
  while ((m = headingPattern.exec(text)) !== null) {
    if (m[1] && m[2].trim()) addItem(m[1], m[2]);
  }

  // Pattern 3: list item - **LABEL** or - **LABEL.** (bold label without inline colon)
  const boldListPattern = /^[-*]\s+\*\*([A-Z]{1,5}[-_]?\d+(?:\.\d+)?)[.*]\*\*\s*([^\n]+)/gm;
  while ((m = boldListPattern.exec(text)) !== null) {
    addItem(m[1], m[2]);
  }

  return items;
}

/**
 * Checks coverage of labeled requirements against combined spec text.
 * Works with any labeled requirement format (CU, US, REQ, FR, RN, NFR, etc.).
 * @param {string} allSpecsText - lowercased concatenated text of all spec files
 * @param {string} requirements - requirements Markdown text
 * @param {string[]} specFiles - list of spec file paths
 */
function checkCoverage(allSpecsText, requirements, specFiles) {
  const allItems = extractLabeledItems(requirements);

  const FUNC_PREFIXES = ['CU', 'US', 'UC', 'HU', 'FR', 'REQ', 'RF'];
  const RULE_PREFIXES = ['RN', 'BR', 'CR', 'RC'];
  const NFR_PREFIXES = ['RNF', 'NFR', 'QA', 'QR', 'NF'];

  const funcRequirements = allItems.filter((i) => FUNC_PREFIXES.some((p) => i.id.startsWith(p)));
  const businessRules = allItems.filter((i) => RULE_PREFIXES.some((p) => i.id.startsWith(p)));
  const nfrItems = allItems.filter((i) => NFR_PREFIXES.some((p) => i.id.startsWith(p)));

  // Fall back to all items when no standard functional prefixes are detected
  const requirementItems = funcRequirements.length > 0 ? funcRequirements : allItems;

  const covered = requirementItems
    .filter((item) => allSpecsText.includes(item.id.toLowerCase()))
    .map((item) => item.id);
  const missing = requirementItems
    .filter((item) => !allSpecsText.includes(item.id.toLowerCase()))
    .map((item) => item.id);

  return { funcRequirements: requirementItems, businessRules, nfrItems, covered, missing };
}

// ─── Gap Analysis ─────────────────────────────────────────────────────────────

/** Vague/ambiguous terms to flag (bilingual). */
const VAGUE_TERMS = [
  'algunos', 'varias', 'varios', 'muchos', 'pocos', 'ciertos',
  'rapido', 'rapidamente', 'lento', 'lentamente',
  'facil', 'facilmente', 'dificil',
  'apropiado', 'apropiada', 'adecuado', 'adecuada', 'conveniente', 'suficiente',
  'cuando sea necesario', 'en la mayoria', 'generalmente',
  'normalmente', 'usualmente', 'tipicamente', 'a veces', 'eventualmente',
  'some', 'many', 'few', 'several', 'various',
  'fast', 'quickly', 'slow', 'easy', 'difficult',
  'appropriate', 'suitable', 'adequate',
  'when necessary', 'in most cases', 'usually', 'typically', 'eventually',
];

/** TODO/pending markers. */
const TODO_PATTERNS = [
  /\bTBD\b/i,
  /\bTODO\b/i,
  /\bpendiente\b/i,
  /\bpor definir\b/i,
  /\ba definir\b/i,
  /\bpor determinar\b/i,
];

/** Standard sections expected in a requirements document. */
const STANDARD_SECTIONS = [
  { patterns: [/actores|usuarios.*actores|actors/i], name: 'Actores / Usuarios' },
  { patterns: [/casos de uso|use cases/i], name: 'Casos de Uso' },
  { patterns: [/reglas de negocio|business rules/i], name: 'Reglas de Negocio' },
  { patterns: [/requerimientos no funcionales|non.?functional|nfr/i], name: 'Requerimientos No Funcionales' },
  { patterns: [/criterios de aceptaci[oó]n|acceptance criteria/i], name: 'Criterios de Aceptación' },
];

/**
 * Analyzes a requirements document for gaps and ambiguities.
 * @param {string} content - Markdown text
 * @returns {{ openQuestions, ambiguousTerms, todoMarkers, missingCriteria, missingSections }}
 */
function analyzeGaps(content) {
  const lines = content.split('\n');
  const contentLower = content.toLowerCase();

  const openQuestions = [];
  const ambiguousTerms = [];
  const todoMarkers = [];
  const missingSections = [];
  const missingCriteria = [];

  // 1. Detect open/unanswered questions (bold question format: **¿...?**)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\*\*¿[^?]+\?\*\*/.test(line)) {
      let answered = false;
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const next = lines[j].trim();
        if (!next) continue;
        if (/\*\*respuesta\*\*/i.test(next)) {
          const resp = next.replace(/.*\*\*respuesta\*\*:?\s*/i, '').trim();
          answered = resp.length > 3;
        }
        break;
      }
      if (!answered) {
        openQuestions.push({ line: i + 1, text: line.trim() });
      }
    }
  }

  // 2. Detect ambiguous terms (use normalized lowercase content)
  const seenTerms = new Set();
  for (const term of VAGUE_TERMS) {
    const termLower = term.toLowerCase();
    const idx = contentLower.indexOf(termLower);
    if (idx !== -1 && !seenTerms.has(term)) {
      seenTerms.add(term);
      const lineNum = content.substring(0, idx).split('\n').length;
      const lineText = (lines[lineNum - 1] || '').trim();
      if (!lineText.startsWith('```') && !lineText.startsWith('//') && !lineText.startsWith('    ')) {
        ambiguousTerms.push({ line: lineNum, term, text: lineText });
      }
    }
  }

  // 3. Detect TODO/TBD markers
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of TODO_PATTERNS) {
      if (pattern.test(lines[i])) {
        todoMarkers.push({ line: i + 1, text: lines[i].trim() });
        break;
      }
    }
  }

  // 4. Detect missing standard sections
  for (const section of STANDARD_SECTIONS) {
    if (!section.patterns.some((p) => p.test(content))) {
      missingSections.push(section.name);
    }
  }

  // 5. Detect functional requirements without acceptance criteria
  const funcItems = extractLabeledItems(content).filter((i) =>
    /^(CU|US|UC|HU|FR|REQ)/i.test(i.id)
  );
  for (const item of funcItems) {
    const idLower = item.id.toLowerCase();
    const idIdx = contentLower.indexOf(idLower);
    if (idIdx === -1) continue;
    const snippet = contentLower.substring(idIdx, Math.min(idIdx + 2500, contentLower.length));
    const hasScenario = /\b(given|when|then|dado que|cuando|entonces)\b/i.test(snippet);
    if (!hasScenario) {
      missingCriteria.push({ id: item.id, description: item.description });
    }
  }

  return { openQuestions, ambiguousTerms, todoMarkers, missingSections, missingCriteria };
}

/**
 * Generates specific, actionable clarification questions from gap analysis results.
 * @param {object} gaps - result of analyzeGaps()
 * @returns {string[]}
 */
function generateClarifications(gaps) {
  const questions = [];

  for (const section of gaps.missingSections) {
    questions.push(
      `📋 **Sección faltante — ${section}**: El documento no contiene esta sección. ` +
        `¿Puede agregar la información de ${section} para completar la especificación?`
    );
  }

  for (const q of gaps.openQuestions.slice(0, 10)) {
    const text = q.text.replace(/\*\*/g, '').substring(0, 120);
    questions.push(
      `❓ **Pregunta sin respuesta (línea ${q.line})**: "${text}" — ` +
        'Por favor, proporcione una respuesta concreta.'
    );
  }

  for (const item of gaps.missingCriteria.slice(0, 15)) {
    questions.push(
      `🎯 **Criterios de aceptación faltantes — ${item.id}** ("${item.description.substring(0, 60)}"): ` +
        'No se encontraron escenarios Given/When/Then. ' +
        '¿Cuándo se considera correctamente implementado? ' +
        'Ejemplo: "Dado que [precondición], Cuando [acción], Entonces [resultado esperado]".'
    );
  }

  const seenTerms = new Set();
  for (const a of gaps.ambiguousTerms.slice(0, 8)) {
    if (!seenTerms.has(a.term)) {
      seenTerms.add(a.term);
      questions.push(
        `🔍 **Término ambiguo — "${a.term}"** (línea ${a.line}): ` +
          `"${a.text.substring(0, 100)}" — ` +
          '¿Puede reemplazar este término por un valor concreto, rango o condición medible?'
      );
    }
  }

  for (const t of gaps.todoMarkers.slice(0, 5)) {
    questions.push(
      `⏳ **Elemento pendiente (línea ${t.line})**: "${t.text.substring(0, 120)}" — ` +
        '¿Cuál es la definición para este elemento?'
    );
  }

  return questions;
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
