import { describe, it, expect, vi } from "vitest";
import ApiFeatures from "../../../utils/apifeatures";

describe("ApiFeatures", () => {
  // Mock for the Mongoose Query
  const createMockQuery = () => {
    return {
      find: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
    };
  };

  describe("search method", () => {
    it("should add regex search to query when keyword is provided", () => {
      const mockQuery = createMockQuery();
      const queryStr = { keyword: "test" };
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.search();
      
      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: "test", $options: "i" }
      });
    });

    it("should not modify query when no keyword is provided", () => {
      const mockQuery = createMockQuery();
      const queryStr = {};
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.search();
      
      expect(mockQuery.find).toHaveBeenCalledWith({});
    });
  });

  describe("filter method", () => {
    it("should remove specified fields from query", () => {
      const mockQuery = createMockQuery();
      const queryStr = { 
        keyword: "test",
        page: "1",
        limit: "10",
        category: "electronics"
      };
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.filter();
      
      // Should remove keyword, page, and limit
      expect(mockQuery.find).toHaveBeenCalledWith({ category: "electronics" });
    });

    it("should replace gt, gte, lt, lte with MongoDB operators", () => {
      const mockQuery = createMockQuery();
      const queryStr = { 
        price: { gt: "1000", lt: "2000" },
        ratings: { gte: "4" }
      };
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.filter();
      
      expect(mockQuery.find).toHaveBeenCalledWith({ 
        price: { $gt: "1000", $lt: "2000" },
        ratings: { $gte: "4" }
      });
    });

    it("should handle empty query strings", () => {
      const mockQuery = createMockQuery();
      const queryStr = {};
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.filter();
      
      expect(mockQuery.find).toHaveBeenCalledWith({});
    });
  });

  describe("pagination method", () => {
    it("should apply limit and skip with default page 1", () => {
      const mockQuery = createMockQuery();
      const queryStr = {};
      const resultPerPage = 10;
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.pagination(resultPerPage);
      
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(0); // (1-1) * 10 = 0
    });

    it("should apply limit and skip with specified page", () => {
      const mockQuery = createMockQuery();
      const queryStr = { page: "3" };
      const resultPerPage = 5;
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.pagination(resultPerPage);
      
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(mockQuery.skip).toHaveBeenCalledWith(10); // (3-1) * 5 = 10
    });

    it("should handle non-numeric page values and default to page 1", () => {
      const mockQuery = createMockQuery();
      const queryStr = { page: "invalid" };
      const resultPerPage = 8;
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      features.pagination(resultPerPage);
      
      expect(mockQuery.limit).toHaveBeenCalledWith(8);
      expect(mockQuery.skip).toHaveBeenCalledWith(0); // Default to page 1 -> (1-1) * 8 = 0
    });
  });

  describe("method chaining", () => {
    it("should support chaining search, filter, and pagination methods", () => {
      const mockQuery = createMockQuery();
      const queryStr = { 
        keyword: "phone",
        category: "electronics",
        price: { gt: "500" },
        page: "2"
      };
      const resultPerPage = 10;
      
      const features = new ApiFeatures(mockQuery as any, queryStr);
      const result = features.search().filter().pagination(resultPerPage);
      
      // Verify chained methods return the instance
      expect(result).toBe(features);
      
      // Verify all methods were called
      expect(mockQuery.find).toHaveBeenCalled();
      expect(mockQuery.limit).toHaveBeenCalled();
      expect(mockQuery.skip).toHaveBeenCalled();
    });
  });
});