// Simple debugging script - paste this in browser console
console.log('=== AUTHENTICATION DEBUGGING ===');

// 1. Cek localStorage
console.log('1. Checking localStorage:');
const token = localStorage.getItem('auth_token');
console.log('   Token exists:', !!token);
console.log('   Token length:', token?.length || 0);
console.log('   Token preview:', token ? token.substring(0, 50) + '...' : 'none');

// 2. Cek user data
console.log('\\n2. Checking user data:');
const userData = localStorage.getItem('user_data');
console.log('   User data exists:', !!userData);
if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('   User role:', user.role);
    console.log('   User email:', user.email);
    console.log('   User name:', user.name);
  } catch (e) {
    console.log('   User data parse error:', e);
  }
}

// 3. Test API calls
console.log('\\n3. Testing API calls:');

async function testAPI() {
  try {
    // Test health API (no auth required)
    console.log('   Testing /api/health...');
    const healthResponse = await fetch('/api/health');
    console.log('   Health status:', healthResponse.status);
    
    // Test auth me API (auth required)
    console.log('   Testing /api/auth/me...');
    const authResponse = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   Auth status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('   Auth user role:', authData.user?.role);
      console.log('   Auth user email:', authData.user?.email);
    } else {
      const errorText = await authResponse.text();
      console.log('   Auth error:', errorText);
    }
    
    // Test admin orders API (admin/owner required)
    console.log('   Testing /api/admin/orders...');
    const adminResponse = await fetch('/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   Admin status:', adminResponse.status);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('   Orders count:', adminData.orders?.length || 0);
    } else {
      const errorText = await adminResponse.text();
      console.log('   Admin error:', errorText);
    }
    
  } catch (error) {
    console.log('   API test error:', error);
  }
}

testAPI();

console.log('\\n=== END DEBUGGING ===');

// 4. Manual fix jika token ada tapi tetap unauthorized
if (token) {
  console.log('\\n4. Manual fix attempt:');
  console.log('   Try refreshing the page...');
  console.log('   Try clearing localStorage and login again...');
  console.log('   localStorage.removeItem("auth_token");');
  console.log('   localStorage.removeItem("user_data");');
}