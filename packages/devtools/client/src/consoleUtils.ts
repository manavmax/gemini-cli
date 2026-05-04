/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InspectorConsoleLog } from '../../src/types.js';

export const CONSOLE_LOG_TYPES = [
  'error',
  'warn',
  'info',
  'debug',
  'log',
] as const;

export type ConsoleLogType = (typeof CONSOLE_LOG_TYPES)[number];
export type ConsoleLogTypeFilter = ConsoleLogType | 'all';

const CONSOLE_LOG_TYPE_LABELS: Record<ConsoleLogType, string> = {
  error: 'Error',
  warn: 'Warning',
  info: 'Info',
  debug: 'Debug',
  log: 'Log',
};

const CONSOLE_LOG_TYPE_SEARCH_TERMS: Record<ConsoleLogType, string[]> = {
  error: ['error', 'errors', 'failure', 'failed'],
  warn: ['warn', 'warning', 'warnings'],
  info: ['info', 'information'],
  debug: ['debug', 'trace'],
  log: ['log', 'logs', 'output'],
};

function createEmptyConsoleLogCounts(): Record<ConsoleLogType, number> {
  return {
    error: 0,
    warn: 0,
    info: 0,
    debug: 0,
    log: 0,
  };
}

function getConsoleLogSearchText(log: InspectorConsoleLog): string {
  return [
    log.content,
    log.type,
    getConsoleLogTypeLabel(log.type),
    ...CONSOLE_LOG_TYPE_SEARCH_TERMS[log.type],
  ]
    .join(' ')
    .toLowerCase();
}

export function isConsoleLogType(value: unknown): value is ConsoleLogType {
  return (
    typeof value === 'string' &&
    (CONSOLE_LOG_TYPES as readonly string[]).includes(value)
  );
}

export function getConsoleLogTypeLabel(type: ConsoleLogType): string {
  return CONSOLE_LOG_TYPE_LABELS[type];
}

export function countConsoleLogsByType(
  logs: InspectorConsoleLog[],
): Record<ConsoleLogType, number> {
  return logs.reduce((counts, log) => {
    counts[log.type] += 1;
    return counts;
  }, createEmptyConsoleLogCounts());
}

export function filterConsoleLogs(
  logs: InspectorConsoleLog[],
  options: {
    query: string;
    type: ConsoleLogTypeFilter;
  },
): InspectorConsoleLog[] {
  const trimmedQuery = options.query.trim().toLowerCase();
  const queryTokens = trimmedQuery.length > 0 ? trimmedQuery.split(/\s+/) : [];

  return logs.filter((log) => {
    if (options.type !== 'all' && log.type !== options.type) {
      return false;
    }

    if (queryTokens.length === 0) {
      return true;
    }

    const searchText = getConsoleLogSearchText(log);
    return queryTokens.every((token) => searchText.includes(token));
  });
}
