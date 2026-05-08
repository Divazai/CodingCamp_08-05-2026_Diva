// Feature: personal-dashboard — Quick links tests
// Properties 7, 13, 14

const fc = require('fast-check');

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock;

const { addLink, deleteLink, validateLinkInput, renderLinks, state } = require('../js/app.js');

// Arbitrary for a valid link object
const linkArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  url: fc.webUrl(),
});

// Helper to reset state before each property run
function resetState(links) {
  state.links = links.map(l => ({ ...l }));
}

// Property 13: Adding a valid link always grows the list by one
// Validates: Requirements 4.1
test('Property 13: adding a valid link always grows the list by one', () => {
  fc.assert(
    fc.property(
      fc.array(linkArb),
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
      fc.webUrl(),
      (links, label, url) => {
        resetState(links);
        const before = state.links.length;
        addLink(label, url);
        expect(state.links.length).toBe(before + 1);
        const added = state.links[state.links.length - 1];
        expect(added.label).toBe(label.trim());
        expect(added.url).toBe(url.trim());
      }
    )
  );
});

// Property 7: Whitespace-only input is always rejected (link side)
// Validates: Requirements 4.2
test('Property 7 (links): whitespace-only label or URL is always rejected', () => {
  fc.assert(
    fc.property(
      fc.array(linkArb),
      fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
      fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
      (links, whitespaceLabel, whitespaceUrl) => {
        resetState(links);
        const before = state.links.length;

        // Whitespace-only label with valid url should be rejected
        expect(validateLinkInput(whitespaceLabel, 'https://example.com')).toBe(false);
        // Valid label with whitespace-only url should be rejected
        expect(validateLinkInput('Example', whitespaceUrl)).toBe(false);
        // Both whitespace should be rejected
        expect(validateLinkInput(whitespaceLabel, whitespaceUrl)).toBe(false);

        // addLink with whitespace label should not grow the list
        addLink(whitespaceLabel, 'https://example.com');
        expect(state.links.length).toBe(before);

        // addLink with whitespace url should not grow the list
        addLink('Example', whitespaceUrl);
        expect(state.links.length).toBe(before);
      }
    )
  );
});

// Property 14: Deleting a link removes exactly that link
// Validates: Requirements 4.4
test('Property 14: deleting a link removes exactly that link', () => {
  fc.assert(
    fc.property(
      fc.array(linkArb, { minLength: 1 }),
      fc.integer({ min: 0 }),
      (links, indexSeed) => {
        resetState(links);
        const index = indexSeed % links.length;
        const targetId = state.links[index].id;
        const before = state.links.length;
        const othersBefore = state.links.filter(l => l.id !== targetId).map(l => ({ ...l }));

        deleteLink(targetId);

        expect(state.links.length).toBe(before - 1);
        expect(state.links.find(l => l.id === targetId)).toBeUndefined();
        expect(state.links).toEqual(othersBefore);
      }
    )
  );
});

// Unit tests: rendered link elements have target="_blank" and correct href (Requirement 4.3)
test('Unit: rendered link elements have target="_blank" and correct href', () => {
  // Build a minimal DOM mock that captures the rendered output
  const createdAnchors = [];

  const makeMockElement = (tag) => {
    const el = {
      _tag: tag,
      _children: [],
      _attrs: {},
      _listeners: {},
      className: '',
      textContent: '',
      href: '',
      target: '',
      rel: '',
      innerHTML: '',
      style: {},
      setAttribute(k, v) { this._attrs[k] = v; },
      getAttribute(k) { return this._attrs[k]; },
      addEventListener(ev, fn) { this._listeners[ev] = fn; },
      appendChild(child) { this._children.push(child); },
      replaceChild() {},
    };
    return el;
  };

  const mockList = makeMockElement('div');
  mockList.innerHTML = '';
  mockList.appendChild = (child) => { mockList._children.push(child); };

  const savedDocument = global.document;
  global.document = {
    getElementById(id) {
      if (id === 'links-list') return mockList;
      return null;
    },
    createElement(tag) {
      const el = makeMockElement(tag);
      if (tag === 'a') createdAnchors.push(el);
      return el;
    },
  };

  const testLinks = [
    { id: 'id-1', label: 'Google', url: 'https://google.com' },
    { id: 'id-2', label: 'GitHub', url: 'https://github.com' },
  ];
  resetState(testLinks);
  renderLinks();

  // Restore document
  global.document = savedDocument;

  expect(createdAnchors.length).toBe(2);

  expect(createdAnchors[0].target).toBe('_blank');
  expect(createdAnchors[0].href).toBe('https://google.com');
  expect(createdAnchors[0].textContent).toBe('Google');

  expect(createdAnchors[1].target).toBe('_blank');
  expect(createdAnchors[1].href).toBe('https://github.com');
  expect(createdAnchors[1].textContent).toBe('GitHub');
});
