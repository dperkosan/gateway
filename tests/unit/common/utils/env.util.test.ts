import { MissingEnvError } from '@common/errors/http-status.error';
import getEnvVariable from '@common/utils/env.util';

describe('getEnvVariable', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('when the environment variable exists', () => {
    it('should return the value of an existing environment variable', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'test-secret';

      // Act
      const value = getEnvVariable('JWT_SECRET');

      // Assert
      expect(value).toBe('test-secret');
    });

    it('should not throw an error when a required variable is set', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';

      // Act & Assert
      expect(getEnvVariable('DATABASE_URL')).toBe(
        'postgres://user:pass@localhost/db',
      );
    });

    it('should return an empty string for non-required variables that are not set', () => {
      // Arrange
      process.env.NODE_ENV = 'development';

      // Act
      const value = getEnvVariable('SOME_NON_REQUIRED_VAR');

      // Assert
      expect(value).toBe('');
    });

    it('should default to "development" if NODE_ENV is not set', () => {
      // Arrange
      delete process.env.NODE_ENV;
      process.env.JWT_SECRET = 'test-secret';

      // Act
      const value = getEnvVariable('JWT_SECRET');

      // Assert
      expect(value).toBe('test-secret');
    });
  });

  describe('when the environment variable is missing', () => {
    it('should throw MissingEnvError for a required "common" variable that is not set', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      delete process.env.JWT_SECRET;

      // Act & Assert
      expect(() => getEnvVariable('JWT_SECRET')).toThrow(MissingEnvError);
      expect(() => getEnvVariable('JWT_SECRET')).toThrow(
        'Environment variable "JWT_SECRET" is missing or undefined',
      );
    });
  });

  describe('when handling edge cases', () => {
    it('should return an empty string for a variable that is set to an empty string', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = '';

      // Act
      const value = getEnvVariable('JWT_SECRET');

      // Assert
      expect(value).toBe('');
    });

    it('should not throw an error for non-required variables even if not set', () => {
      // Arrange
      process.env.NODE_ENV = 'test';

      // Act
      const value = getEnvVariable('NON_REQUIRED_VAR');

      // Assert
      expect(value).toBe('');
    });
  });
});
