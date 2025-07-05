/**
 * Supplier Creation Tests
 * Tests for creating suppliers with various scenarios
 */

const axios = require('axios');

// Mock data for testing (matching actual API schema)
const mockSupplierData = {
  manufacturer: {
    supplier_code: 'MFG001',
    company_name: 'Tech Manufacturing Corp',
    supplier_type: 'MANUFACTURER',
    contact_person: 'John Smith',
    email: 'john.smith@techmanufacturing.com',
    phone: '+1-555-0123',
    address: '123 Industrial Blvd, Manufacturing City, MC 12345',
    tax_id: 'TAX123456789',
    payment_terms: 'NET30',
    credit_limit: 50000.00,
    supplier_tier: 'PREFERRED'
  },
  
  distributor: {
    supplier_code: 'DIST001',
    company_name: 'Regional Distribution Co',
    supplier_type: 'DISTRIBUTOR',
    contact_person: 'Jane Doe',
    email: 'jane.doe@regionaldist.com',
    phone: '+1-555-0456',
    address: '456 Distribution Ave, Warehouse City, WC 67890',
    tax_id: 'TAX987654321',
    payment_terms: 'NET45',
    credit_limit: 25000.00,
    supplier_tier: 'STANDARD'
  },

  serviceProvider: {
    supplier_code: 'SRV001',
    company_name: 'Professional Services LLC',
    supplier_type: 'SERVICE_PROVIDER',
    contact_person: 'Mike Johnson',
    email: 'mike@professionalservices.com',
    phone: '+1-555-0789',
    payment_terms: 'NET15',
    credit_limit: 10000.00,
    supplier_tier: 'STANDARD'
  }
};

const API_BASE_URL = 'http://localhost:8001/api/v1';

describe('Supplier Creation Tests', () => {
  let authToken = null;

  beforeAll(async () => {
    // Get authentication token
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login-simple`, {
        email: 'admin@rental.com',
        password: 'admin123'
      });
      
      if (response.data && response.data.access_token) {
        authToken = response.data.access_token;
      }
    } catch (error) {
      console.error('Failed to authenticate:', error.response?.data || error.message);
    }
  });

  afterAll(async () => {
    if (authToken) {
      try {
        console.log('Test cleanup completed');
      } catch (error) {
        console.error('Cleanup failed:', error.message);
      }
    }
  });

  describe('Manufacturer Supplier Creation', () => {
    test('should create manufacturer supplier with complete information', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        ...mockSupplierData.manufacturer,
        supplier_code: `MFG${Date.now()}${Math.random().toString(36).substr(2, 5)}`
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.supplier_code).toBe(supplierData.supplier_code.toUpperCase());
      expect(response.data.company_name).toBe('Tech Manufacturing Corp');
      expect(response.data.supplier_type).toBe('MANUFACTURER');
      expect(response.data.contact_person).toBe('John Smith');
      expect(response.data.email).toBe('john.smith@techmanufacturing.com');
      expect(response.data.phone).toBe('+1-555-0123');
      expect(response.data.payment_terms).toBe('NET30');
      expect(parseFloat(response.data.credit_limit)).toBe(50000.00);
      expect(response.data.supplier_tier).toBe('PREFERRED');
      expect(response.data.is_active).toBe(true);
    });

    test('should create supplier with minimal required fields', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        supplier_code: `MIN${Date.now()}`,
        company_name: 'Minimal Supplier Inc',
        supplier_type: 'WHOLESALER'
        // Only required fields provided
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.supplier_code).toBe(supplierData.supplier_code.toUpperCase());
      expect(response.data.company_name).toBe('Minimal Supplier Inc');
      expect(response.data.supplier_type).toBe('WHOLESALER');
      expect(response.data.payment_terms).toBe('NET30'); // Default value
      expect(parseFloat(response.data.credit_limit)).toBe(0); // Default value
      expect(response.data.supplier_tier).toBe('STANDARD'); // Default value
    });

    test('should reject supplier without required fields', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        // Missing company_name and supplier_type
        contact_person: 'Test Contact',
        email: 'test@example.com'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should reject supplier without supplier_code', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        // Missing supplier_code
        company_name: 'Test Company',
        supplier_type: 'MANUFACTURER'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });
  });

  describe('Different Supplier Types Creation', () => {
    test('should create distributor supplier', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        ...mockSupplierData.distributor,
        supplier_code: `DIST${Date.now()}${Math.random().toString(36).substr(2, 3)}`
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.supplier_type).toBe('DISTRIBUTOR');
      expect(response.data.payment_terms).toBe('NET45');
      expect(parseFloat(response.data.credit_limit)).toBe(25000.00);
      expect(response.data.supplier_tier).toBe('STANDARD');
    });

    test('should create service provider supplier', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        ...mockSupplierData.serviceProvider,
        supplier_code: `SRV${Date.now()}${Math.random().toString(36).substr(2, 3)}`
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.supplier_type).toBe('SERVICE_PROVIDER');
      expect(response.data.payment_terms).toBe('NET15');
      expect(parseFloat(response.data.credit_limit)).toBe(10000.00);
    });

    test('should create retailer supplier', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        supplier_code: `RET${Date.now()}`,
        company_name: 'Retail Partner Store',
        supplier_type: 'RETAILER',
        contact_person: 'Store Manager',
        email: 'manager@retailpartner.com',
        payment_terms: 'COD',
        supplier_tier: 'RESTRICTED'
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.supplier_type).toBe('RETAILER');
      expect(response.data.payment_terms).toBe('COD');
      expect(response.data.supplier_tier).toBe('RESTRICTED');
    });

    test('should create wholesaler supplier', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        supplier_code: `WHO${Date.now()}`,
        company_name: 'Wholesale Supply House',
        supplier_type: 'WHOLESALER',
        payment_terms: 'PREPAID',
        credit_limit: 75000.00
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.supplier_type).toBe('WHOLESALER');
      expect(response.data.payment_terms).toBe('PREPAID');
      expect(parseFloat(response.data.credit_limit)).toBe(75000.00);
    });
  });

  describe('Supplier Creation Validation Tests', () => {
    test('should handle invalid supplier type', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        company_name: 'Invalid Type Company',
        supplier_type: 'INVALID_TYPE'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should handle invalid payment terms', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        company_name: 'Invalid Payment Terms Company',
        supplier_type: 'MANUFACTURER',
        payment_terms: 'INVALID_TERMS'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should handle invalid supplier tier', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        company_name: 'Invalid Tier Company',
        supplier_type: 'MANUFACTURER',
        supplier_tier: 'INVALID_TIER'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should handle negative credit limit', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        company_name: 'Negative Credit Company',
        supplier_type: 'MANUFACTURER',
        credit_limit: -5000.00
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should handle invalid email format', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        company_name: 'Invalid Email Company',
        supplier_type: 'MANUFACTURER',
        email: 'invalid-email-format'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should handle duplicate supplier code', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierCode = `DUP${Date.now()}`;
      const supplierData = {
        supplier_code: supplierCode,
        company_name: 'First Duplicate Company',
        supplier_type: 'MANUFACTURER'
      };

      // Create first supplier
      await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Try to create second supplier with same code
      const duplicateData = {
        ...supplierData,
        company_name: 'Second Duplicate Company'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          duplicateData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 409, 422]).toContain(error.response.status);
      }
    });

    test('should handle supplier_code too long', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: 'A'.repeat(51), // Too long (max 50 characters)
        company_name: 'Long Code Company',
        supplier_type: 'MANUFACTURER'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });

    test('should handle company_name too long', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const invalidData = {
        supplier_code: `INV${Date.now()}`,
        company_name: 'A'.repeat(256), // Too long (max 255 characters)
        supplier_type: 'MANUFACTURER'
      };

      try {
        await axios.post(
          `${API_BASE_URL}/suppliers/`,
          invalidData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        expect(true).toBe(false);
      } catch (error) {
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data.detail).toBeDefined();
      }
    });
  });

  describe('Supplier Creation Edge Cases', () => {
    test('should convert supplier_code to uppercase', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        supplier_code: `lowercase${Date.now()}`,
        company_name: 'Lowercase Code Company',
        supplier_type: 'MANUFACTURER'
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.supplier_code).toBe(supplierData.supplier_code.toUpperCase());
    });

    test('should trim whitespace from company_name', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        supplier_code: `TRIM${Date.now()}`,
        company_name: '  Whitespace Company  ',
        supplier_type: 'MANUFACTURER'
      };

      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.company_name).toBe('Whitespace Company');
    });

    test('should handle all payment terms options', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const paymentTerms = ['NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'COD', 'PREPAID'];
      
      for (const terms of paymentTerms) {
        const supplierData = {
          supplier_code: `PAY${Date.now()}${Math.random().toString(36).substr(2, 3)}`,
          company_name: `Payment Terms ${terms} Company`,
          supplier_type: 'MANUFACTURER',
          payment_terms: terms
        };

        const response = await axios.post(
          `${API_BASE_URL}/suppliers/`,
          supplierData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        expect(response.status).toBe(201);
        expect(response.data.payment_terms).toBe(terms);
      }
    });

    test('should handle all supplier tier options', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierTiers = ['PREFERRED', 'STANDARD', 'RESTRICTED'];
      
      for (const tier of supplierTiers) {
        const supplierData = {
          supplier_code: `TIER${Date.now()}${Math.random().toString(36).substr(2, 3)}`,
          company_name: `Tier ${tier} Company`,
          supplier_type: 'MANUFACTURER',
          supplier_tier: tier
        };

        const response = await axios.post(
          `${API_BASE_URL}/suppliers/`,
          supplierData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        expect(response.status).toBe(201);
        expect(response.data.supplier_tier).toBe(tier);
      }
    });
  });

  describe('Supplier Creation Performance', () => {
    test('should create supplier within reasonable time', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const supplierData = {
        supplier_code: `PERF${Date.now()}`,
        company_name: 'Performance Test Company',
        supplier_type: 'MANUFACTURER',
        contact_person: 'Performance Tester',
        email: 'perf@test.com'
      };

      const startTime = Date.now();
      
      const response = await axios.post(
        `${API_BASE_URL}/suppliers/`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(201);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle concurrent supplier creation', async () => {
      if (!authToken) {
        throw new Error('Authentication required for this test');
      }

      const timestamp = Date.now();
      
      const supplierData1 = {
        supplier_code: `CON1${timestamp}`,
        company_name: 'Concurrent Test Company 1',
        supplier_type: 'MANUFACTURER'
      };

      const supplierData2 = {
        supplier_code: `CON2${timestamp}`,
        company_name: 'Concurrent Test Company 2',
        supplier_type: 'DISTRIBUTOR'
      };

      const promises = [
        axios.post(
          `${API_BASE_URL}/suppliers/`,
          supplierData1,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        ),
        axios.post(
          `${API_BASE_URL}/suppliers/`,
          supplierData2,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      ];

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
      });

      // Verify that both suppliers have different IDs
      expect(responses[0].data.id).not.toBe(responses[1].data.id);
      expect(responses[0].data.supplier_code).not.toBe(responses[1].data.supplier_code);
    });
  });
});