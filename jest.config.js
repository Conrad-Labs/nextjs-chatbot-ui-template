module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic'
            }
          }
        }
      }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(remark-gfm|remark-math|micromark-extension-gfm|micromark|next-auth|react-markdown|@next-auth)|nanoid/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^next-auth/react$': '<rootDir>/node_modules/next-auth/react',
    '^next-auth$': '<rootDir>/node_modules/next-auth',
    '^ai/rsc$': '<rootDir>/node_modules/ai/rsc',
    '^ai$': '<rootDir>/node_modules/ai'
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/app/constants',
    '<rootDir>/components/ui/*'
  ]
}
