import { buildQuery } from 'gqty/QueryBuilder';
import { Selection } from '../src/Selection';

describe('selection creation', () => {
  test('selection with manager and separating types', () => {
    const mutationRoot = Selection.createRoot('mutation');
    const selectionA = mutationRoot.getChild('a');

    expect(selectionA.key).toBe('a');
    expect(selectionA.alias).toBe(undefined);
    expect(selectionA.root.key).toBe('mutation');

    expect(selectionA.input?.values).toBe(undefined);
    expect(selectionA.input?.types).toBe(undefined);
    expect(selectionA.ancestry).toEqual([mutationRoot, selectionA]);

    expect(selectionA.cacheKeys).toEqual(['mutation', 'a']);

    const selectionB = selectionA.getChild('b');

    expect(selectionB.key).toBe('b');
    expect(selectionB.root.key).toBe('mutation');

    expect(selectionB.ancestry).toEqual([mutationRoot, selectionA, selectionB]);
    expect(selectionB.cacheKeys).toEqual(['mutation', 'a', 'b']);

    const selectionC = selectionB.getChild(0);

    expect(selectionC.cacheKeys).toEqual(selectionB.cacheKeys);

    const selectionD = selectionC.getChild('d', {
      input: {
        types: { a: 'Int!' },
        values: { a: 1 },
      },
    });

    expect(selectionD.ancestry.map((s) => s.alias ?? s.key)).toEqual([
      'mutation',
      'a',
      'b',
      0,
      'b424a',
    ]);
    expect(selectionD.alias).toBe('b424a');

    const repeatSelectionD = selectionC.getChild('d', {
      input: {
        types: { a: 'Int!' },
        values: { a: 1 },
      },
    });

    expect(repeatSelectionD.ancestry.map((s) => s.alias ?? s.key)).toEqual([
      'mutation',
      'a',
      'b',
      0,
      'b424a',
    ]);
    expect(repeatSelectionD.alias).toBe('b424a');

    const selectionE = selectionD.getChild('e');

    expect(selectionE.ancestry.map((s) => s.alias ?? s.key)).toEqual([
      'mutation',
      'a',
      'b',
      0,
      'b424a',
      'e',
    ]);

    const selectionF = Selection.createRoot('f');

    const selectionG = Selection.createRoot('subscription').getChild('g');

    expect(selectionF.cacheKeys).toEqual(['f']);

    expect(
      buildQuery(
        new Set([
          selectionA,
          selectionB,
          selectionC,
          selectionD,
          selectionE,
          selectionD,
          repeatSelectionD,
          selectionF,
          selectionG,
        ])
      ).length
    ).toEqual(3);
  });
});
