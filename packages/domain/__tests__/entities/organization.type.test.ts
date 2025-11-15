import { describe, expect, it } from 'vitest';
import { OrganizationEntity } from '../../src/entities/organization.type';
import type { Organization } from '../../src/entities/organization.type';

describe('OrganizationEntity', () => {
  const createTestOrganization = (): Organization => ({
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Organization',
    slug: 'test-org',
    is_owner: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'user-id',
    updatedBy: 'user-id',
  });

  describe('create', () => {
    it('should create a new organization entity', () => {
      const entity = OrganizationEntity.create({
        name: 'New Organization',
        is_owner: false,
        createdBy: 'user-id',
      });

      expect(entity.id).toBeDefined();
      expect(entity.name).toBe('New Organization');
      expect(entity.slug).toBeDefined();
      expect(entity.is_owner).toBe(false);
    });
  });

  describe('update', () => {
    it('should update organization name', () => {
      const organization = createTestOrganization();
      const updated = OrganizationEntity.update(organization, {
        id: organization.id,
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.is_owner).toBe(organization.is_owner);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        organization.updatedAt.getTime(),
      );
    });

    it('should update is_owner field', () => {
      const organization = createTestOrganization();
      const updated = OrganizationEntity.update(organization, {
        id: organization.id,
        is_owner: false,
      });

      expect(updated.is_owner).toBe(false);
      expect(updated.name).toBe(organization.name);
    });

    it('should update updatedBy field', () => {
      const organization = createTestOrganization();
      const updated = OrganizationEntity.update(organization, {
        id: organization.id,
        updatedBy: 'new-user-id',
      });

      expect(updated.updatedBy).toBe('new-user-id');
    });

    it('should update multiple fields', () => {
      const organization = createTestOrganization();
      const updated = OrganizationEntity.update(organization, {
        id: organization.id,
        name: 'New Name',
        is_owner: false,
        updatedBy: 'new-user',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.is_owner).toBe(false);
      expect(updated.updatedBy).toBe('new-user');
    });

    it('should preserve unchanged fields', () => {
      const organization = createTestOrganization();
      const updated = OrganizationEntity.update(organization, {
        id: organization.id,
        name: 'Updated Name',
      });

      expect(updated.slug).toBe(organization.slug);
      expect(updated.createdBy).toBe(organization.createdBy);
      expect(updated.createdAt).toEqual(organization.createdAt);
    });

    it('should handle is_owner being set to false when it was true', () => {
      const organization = createTestOrganization();
      expect(organization.is_owner).toBe(true);

      const updated = OrganizationEntity.update(organization, {
        id: organization.id,
        is_owner: false,
      });

      expect(updated.is_owner).toBe(false);
    });
  });
});
