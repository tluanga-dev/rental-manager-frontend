#!/usr/bin/env python3
"""
API Server Testing Script
Tests all endpoints of the rental management FastAPI backend
"""

import asyncio
import json
import time
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import aiohttp
import sys

@dataclass
class TestResult:
    endpoint: str
    method: str
    status_code: int
    response_time: float
    success: bool
    error: Optional[str] = None
    response_data: Optional[Dict] = None

class APITester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results: List[TestResult] = []
        
    async def test_endpoint(self, 
                           endpoint: str, 
                           method: str = "GET", 
                           data: Optional[Dict] = None,
                           headers: Optional[Dict] = None) -> TestResult:
        """Test a single API endpoint"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method, 
                    url=url, 
                    json=data,
                    headers=headers or {},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time = time.time() - start_time
                    
                    try:
                        response_data = await response.json()
                    except:
                        response_data = {"text": await response.text()}
                    
                    result = TestResult(
                        endpoint=endpoint,
                        method=method,
                        status_code=response.status,
                        response_time=response_time,
                        success=200 <= response.status < 300,
                        response_data=response_data
                    )
                    
        except Exception as e:
            response_time = time.time() - start_time
            result = TestResult(
                endpoint=endpoint,
                method=method,
                status_code=0,
                response_time=response_time,
                success=False,
                error=str(e)
            )
        
        self.results.append(result)
        return result
    
    async def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting API Server Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Basic endpoints
        print("\n📋 Testing Basic Endpoints")
        await self.test_basic_endpoints()
        
        # Test 2: Authentication endpoints
        print("\n🔐 Testing Authentication Endpoints")
        await self.test_auth_endpoints()
        
        # Test 3: Category endpoints
        print("\n📁 Testing Category Endpoints")
        await self.test_category_endpoints()
        
        # Test 4: Other resource endpoints
        print("\n📦 Testing Resource Endpoints")
        await self.test_resource_endpoints()
        
        # Generate report
        self.generate_report()
    
    async def test_basic_endpoints(self):
        """Test basic server endpoints"""
        endpoints = [
            "/",
            "/health",
            "/docs",
            "/openapi.json"
        ]
        
        for endpoint in endpoints:
            result = await self.test_endpoint(endpoint)
            status = "✅" if result.success else "❌"
            print(f"   {status} {endpoint} - {result.status_code} ({result.response_time:.3f}s)")
            if result.error:
                print(f"      Error: {result.error}")
    
    async def test_auth_endpoints(self):
        """Test authentication endpoints"""
        # Test auth endpoints
        auth_endpoints = [
            "/api/v1/auth/demo/admin",
            "/api/v1/auth/demo/manager", 
            "/api/v1/auth/demo/staff",
            "/api/v1/users"
        ]
        
        for endpoint in auth_endpoints:
            result = await self.test_endpoint(endpoint, method="POST")
            status = "✅" if result.success else "❌"
            print(f"   {status} POST {endpoint} - {result.status_code} ({result.response_time:.3f}s)")
            if result.error:
                print(f"      Error: {result.error}")
    
    async def test_category_endpoints(self):
        """Test category-related endpoints"""
        # Test GET categories
        result = await self.test_endpoint("/api/v1/categories")
        status = "✅" if result.success else "❌"
        print(f"   {status} GET /api/v1/categories - {result.status_code} ({result.response_time:.3f}s)")
        
        if result.success and result.response_data:
            categories = result.response_data.get('data', [])
            print(f"      Found {len(categories)} categories")
        
        # Skip POST category test - no mock data
    
    async def test_resource_endpoints(self):
        """Test other resource endpoints"""
        endpoints = [
            ("/api/v1/locations", "GET"),
            ("/api/v1/brands", "GET"),
            ("/api/v1/customers", "GET"),
            ("/api/v1/item-masters", "GET"),
            ("/api/v1/skus", "GET"),
        ]
        
        for endpoint, method in endpoints:
            result = await self.test_endpoint(endpoint, method=method)
            status = "✅" if result.success else "❌"
            print(f"   {status} {method} {endpoint} - {result.status_code} ({result.response_time:.3f}s)")
            
            if result.success and result.response_data:
                if 'data' in result.response_data:
                    count = len(result.response_data['data'])
                    print(f"      Found {count} items")
            
            if result.error:
                print(f"      Error: {result.error}")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("📊 API TEST REPORT")
        print("=" * 60)
        
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - successful_tests
        
        print(f"\nOverall Results:")
        print(f"  Total Tests: {total_tests}")
        print(f"  ✅ Successful: {successful_tests}")
        print(f"  ❌ Failed: {failed_tests}")
        print(f"  Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        # Performance stats
        response_times = [r.response_time for r in self.results if r.success]
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            max_time = max(response_times)
            min_time = min(response_times)
            
            print(f"\nPerformance:")
            print(f"  Average Response Time: {avg_time:.3f}s")
            print(f"  Fastest Response: {min_time:.3f}s")
            print(f"  Slowest Response: {max_time:.3f}s")
        
        # Failed tests details
        failed_results = [r for r in self.results if not r.success]
        if failed_results:
            print(f"\n❌ Failed Tests:")
            for result in failed_results:
                print(f"  {result.method} {result.endpoint}")
                if result.error:
                    print(f"    Error: {result.error}")
                else:
                    print(f"    Status: {result.status_code}")
                    if result.response_data:
                        print(f"    Response: {result.response_data}")
        
        # Successful endpoints
        successful_results = [r for r in self.results if r.success]
        if successful_results:
            print(f"\n✅ Working Endpoints:")
            for result in successful_results:
                print(f"  {result.method} {result.endpoint} ({result.status_code})")
        
        # Save detailed results
        report_data = {
            "summary": {
                "total_tests": total_tests,
                "successful": successful_tests,
                "failed": failed_tests,
                "success_rate": (successful_tests/total_tests)*100
            },
            "results": [
                {
                    "endpoint": r.endpoint,
                    "method": r.method,
                    "status_code": r.status_code,
                    "response_time": r.response_time,
                    "success": r.success,
                    "error": r.error,
                    "response_preview": str(r.response_data)[:200] if r.response_data else None
                }
                for r in self.results
            ]
        }
        
        with open("api-test-results.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n💾 Detailed results saved to api-test-results.json")
        
        # Final verdict
        if successful_tests == total_tests:
            print(f"\n🎉 All tests passed! API server is fully functional.")
        elif successful_tests > total_tests * 0.8:
            print(f"\n✅ Most tests passed. API server is mostly functional with some issues.")
        else:
            print(f"\n⚠️ Many tests failed. API server has significant issues.")

async def main():
    """Main test runner"""
    try:
        tester = APITester()
        await tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test suite failed: {e}")

if __name__ == "__main__":
    # Check if aiohttp is available
    try:
        import aiohttp
    except ImportError:
        print("❌ aiohttp not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp"])
        import aiohttp
    
    # Run tests
    asyncio.run(main())