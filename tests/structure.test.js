// Feature: personal-dashboard — Structure tests
// Validates: Requirements 6.1, 6.2

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

describe('index.html structure', () => {
  test('contains exactly one <link> to css/style.css (Req 6.1)', () => {
    const matches = html.match(/<link[^>]+href=["']css\/style\.css["'][^>]*>/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(1);
  });

  test('contains exactly one <script> pointing to js/app.js (Req 6.2)', () => {
    const matches = html.match(/<script[^>]+src=["']js\/app\.js["'][^>]*>/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(1);
  });
});
