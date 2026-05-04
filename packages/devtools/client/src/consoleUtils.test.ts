/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import type { InspectorConsoleLog } from '../../src/types.js';
import {
  countConsoleLogsByType,
  filterConsoleLogs,
  getConsoleLogTypeLabel,
  isConsoleLogType,
} from './consoleUtils.js';

function createLog(
  overrides: Partial<InspectorConsoleLog>,
): InspectorConsoleLog {
  return {
    id: overrides.id ?? 'log-id',
    timestamp: overrides.timestamp ?? 1,
    type: overrides.type ?? 'log',
    content: overrides.content ?? 'message',
    sessionId: overrides.sessionId,
  };
}

describe('consoleUtils', () => {
  describe('isConsoleLogType', () => {
    it('accepts known console log types', () => {
      expect(isConsoleLogType('error')).toBe(true);
      expect(isConsoleLogType('warn')).toBe(true);
      expect(isConsoleLogType('info')).toBe(true);
      expect(isConsoleLogType('debug')).toBe(true);
      expect(isConsoleLogType('log')).toBe(true);
    });

    it('rejects unknown values', () => {
      expect(isConsoleLogType('console')).toBe(false);
      expect(isConsoleLogType('trace')).toBe(false);
      expect(isConsoleLogType(null)).toBe(false);
    });
  });

  describe('getConsoleLogTypeLabel', () => {
    it('returns a human readable label', () => {
      expect(getConsoleLogTypeLabel('warn')).toBe('Warning');
    });
  });

  describe('countConsoleLogsByType', () => {
    it('returns counts for each log type', () => {
      const logs: InspectorConsoleLog[] = [
        createLog({ type: 'error', id: '1' }),
        createLog({ type: 'error', id: '2' }),
        createLog({ type: 'warn', id: '3' }),
        createLog({ type: 'debug', id: '4' }),
      ];

      expect(countConsoleLogsByType(logs)).toEqual({
        error: 2,
        warn: 1,
        info: 0,
        debug: 1,
        log: 0,
      });
    });
  });

  describe('filterConsoleLogs', () => {
    const logs: InspectorConsoleLog[] = [
      createLog({
        id: '1',
        type: 'error',
        content: 'Request failed with status 500',
      }),
      createLog({
        id: '2',
        type: 'warn',
        content: 'Retrying request after backoff',
      }),
      createLog({
        id: '3',
        type: 'debug',
        content: 'Auth token refresh complete',
      }),
      createLog({
        id: '4',
        type: 'log',
        content: 'Server started successfully',
      }),
    ];

    it('filters by selected log type', () => {
      expect(filterConsoleLogs(logs, { query: '', type: 'warn' })).toEqual([
        logs[1],
      ]);
    });

    it('matches search text case-insensitively', () => {
      expect(
        filterConsoleLogs(logs, { query: 'STATUS 500', type: 'all' }),
      ).toEqual([logs[0]]);
    });

    it('matches severity aliases from classification terms', () => {
      expect(
        filterConsoleLogs(logs, { query: 'warning retrying', type: 'all' }),
      ).toEqual([logs[1]]);
    });

    it('combines text search with the selected type filter', () => {
      expect(
        filterConsoleLogs(logs, { query: 'request', type: 'error' }),
      ).toEqual([logs[0]]);
      expect(
        filterConsoleLogs(logs, { query: 'request', type: 'debug' }),
      ).toEqual([]);
    });
  });
});
