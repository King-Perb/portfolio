#!/usr/bin/env node
/**
 * E2E Test Coverage Analysis Script
 *
 * Analyzes e2e test files to determine:
 * - Which routes/pages are covered
 * - Which user flows are tested
 * - Coverage gaps
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface RouteCoverage {
  route: string;
  tested: boolean;
  testFiles: string[];
  testCount: number;
}

interface FlowCoverage {
  flow: string;
  tested: boolean;
  testFiles: string[];
}

interface CoverageReport {
  routes: RouteCoverage[];
  totalRoutes: number;
  coveredRoutes: number;
  coveragePercentage: number;
  missingRoutes: string[];
  flows: FlowCoverage[];
  totalFlows: number;
  coveredFlows: number;
  testFiles: string[];
}

// Known routes in the application
const KNOWN_ROUTES = [
  '/',
  '/overview',
  '/projects',
  '/stack',
  '/contact',
  '/ai-miko',
  '/design',
];

// User flows to check
const USER_FLOWS = [
  'navigation',
  'page-transition-animation',
  'mobile-navigation',
  'responsive-design',
  'ai-chat',
  'project-interaction',
  'contact-form',
  'metrics-display',
];

async function analyzeE2ETests(): Promise<CoverageReport> {
  const e2eDir = join(process.cwd(), 'e2e');
  const testFiles = (await readdir(e2eDir))
    .filter(file => file.endsWith('.spec.ts') || file.endsWith('.spec.js'));

  const routeCoverage: RouteCoverage[] = KNOWN_ROUTES.map(route => ({
    route,
    tested: false,
    testFiles: [],
    testCount: 0,
  }));

  const flowCoverage: FlowCoverage[] = USER_FLOWS.map(flow => ({
    flow,
    tested: false,
    testFiles: [],
  }));

  // Analyze each test file
  for (const testFile of testFiles) {
    const content = await readFile(join(e2eDir, testFile), 'utf-8');
    const fileName = testFile.toLowerCase().replace('.spec.ts', '').replace('.spec.js', '');

    // Check which routes are tested
    for (const routeCoverageItem of routeCoverage) {
      const routePattern = new RegExp(
        `(goto|navigate|visit|url).*['"]${routeCoverageItem.route.replace(/\//g, '\\/')}['"]`,
        'i'
      );

      if (routePattern.test(content) || content.includes(`'${routeCoverageItem.route}'`) || content.includes(`"${routeCoverageItem.route}"`)) {
        routeCoverageItem.tested = true;
        routeCoverageItem.testFiles.push(testFile);
        routeCoverageItem.testCount += (content.match(routePattern) || []).length;
      }
    }

    // Check which user flows are tested (by filename and content)
    for (const flowItem of flowCoverage) {
      const flowKeywords = flowItem.flow.toLowerCase().split('-');

      // Check if test file name matches flow
      const fileNameMatches = flowKeywords.some(keyword => fileName.includes(keyword));

      // Check if content mentions the flow
      const contentMatches = flowKeywords.some(keyword =>
        content.toLowerCase().includes(keyword)
      );

      if (fileNameMatches || contentMatches) {
        flowItem.tested = true;
        if (!flowItem.testFiles.includes(testFile)) {
          flowItem.testFiles.push(testFile);
        }
      }
    }
  }

  const coveredRoutes = routeCoverage.filter(r => r.tested).length;
  const missingRoutes = routeCoverage.filter(r => !r.tested).map(r => r.route);
  const coveredFlows = flowCoverage.filter(f => f.tested).length;

  return {
    routes: routeCoverage,
    totalRoutes: KNOWN_ROUTES.length,
    coveredRoutes,
    coveragePercentage: (coveredRoutes / KNOWN_ROUTES.length) * 100,
    missingRoutes,
    flows: flowCoverage,
    totalFlows: USER_FLOWS.length,
    coveredFlows,
    testFiles,
  };
}

function printReport(report: CoverageReport): void {
  console.log('\n📊 E2E Test Coverage Report\n');
  console.log('═'.repeat(60));

  console.log('\n📈 Overall Coverage:');
  console.log(`   Routes Covered: ${report.coveredRoutes}/${report.totalRoutes} (${report.coveragePercentage.toFixed(1)}%)`);
  console.log(`   User Flows Covered: ${report.coveredFlows}/${report.totalFlows} (${((report.coveredFlows / report.totalFlows) * 100).toFixed(1)}%)`);

  console.log('\n✅ Covered Routes:');
  report.routes
    .filter(r => r.tested)
    .forEach(route => {
      console.log(`   ✓ ${route.route.padEnd(20)} (${route.testCount} test(s) in ${route.testFiles.length} file(s))`);
      route.testFiles.forEach(file => console.log(`     └─ ${file}`));
    });

  if (report.missingRoutes.length > 0) {
    console.log('\n❌ Missing Route Coverage:');
    report.missingRoutes.forEach(route => {
      console.log(`   ✗ ${route}`);
    });
  }

  console.log('\n✅ Covered User Flows:');
  report.flows
    .filter(f => f.tested)
    .forEach(flow => {
      console.log(`   ✓ ${flow.flow.padEnd(25)} (${flow.testFiles.length} file(s))`);
      flow.testFiles.forEach(file => console.log(`     └─ ${file}`));
    });

  const missingFlows = report.flows.filter(f => !f.tested).map(f => f.flow);
  if (missingFlows.length > 0) {
    console.log('\n❌ Missing User Flow Coverage:');
    missingFlows.forEach(flow => {
      console.log(`   ✗ ${flow}`);
    });
  }

  console.log('\n📁 Test Files:');
  report.testFiles.forEach(file => {
    console.log(`   • ${file}`);
  });

  console.log('\n💡 Recommendations:');

  if (report.missingRoutes.length > 0) {
    console.log(`   • Add e2e tests for routes: ${report.missingRoutes.join(', ')}`);
  }

  if (missingFlows.length > 0) {
    console.log(`   • Add e2e tests for user flows: ${missingFlows.join(', ')}`);
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

// Run analysis
try {
  const results = await analyzeE2ETests();
  printReport(results);
} catch (error) {
  console.error('Error analyzing e2e tests:', error);
  process.exit(1);
}
