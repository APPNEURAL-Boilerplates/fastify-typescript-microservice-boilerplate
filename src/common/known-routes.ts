export interface KnownRoute {
  pattern: RegExp;
  methods: readonly string[];
}

export const knownRoutes: KnownRoute[] = [
  { pattern: /^\/$/, methods: ['GET'] },
  { pattern: /^\/api\/v1\/health\/?$/, methods: ['GET'] },
  { pattern: /^\/api\/v1\/ready\/?$/, methods: ['GET'] },
  { pattern: /^\/api\/v1\/items\/?$/, methods: ['GET', 'POST'] },
  { pattern: /^\/api\/v1\/items\/[^/]+\/?$/, methods: ['GET'] }
];

export function allowedMethodsForPath(pathname: string): readonly string[] | undefined {
  return knownRoutes.find((route) => route.pattern.test(pathname))?.methods;
}
