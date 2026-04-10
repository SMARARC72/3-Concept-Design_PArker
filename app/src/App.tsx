import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation
function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <nav style={{ 
      padding: '20px', 
      borderBottom: '1px solid #eee',
      display: 'flex',
      gap: '20px',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '24px' }}>ParkerJoe</Link>
      <Link to="/shop">Shop</Link>
      <Link to="/style-lounge">Style Lounge</Link>
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.firstName}</span>
            <Link to="/account">Account</Link>
            <button onClick={() => logout()}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// Home Page
function HomePage() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>Welcome to ParkerJoe</h1>
      <p>Premium boys' clothing boutique</p>
    </div>
  );
}

// Shop Page
function ShopPage() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>Shop</h1>
      <p>Browse our collection</p>
    </div>
  );
}

// Style Lounge Page
function StyleLoungePage() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>PJ Style Lounge</h1>
      <p>Your personal fashion destination</p>
    </div>
  );
}

// Login Page
function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/account');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate('/account');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login</h1>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#fee', 
          color: '#c00',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#0F1F3C',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <Link to="/auth/signup">Sign up</Link>
      </p>
    </div>
  );
}

// Sign Up Page
function SignUpPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/account');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await signup(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.needsEmailConfirmation) {
      setMessage('Account created! Please check your email to confirm your account before logging in.');
      setLoading(false);
    } else {
      navigate('/account');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Create Account</h1>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#fee', 
          color: '#c00',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ 
          padding: '10px', 
          background: '#efe', 
          color: '#060',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#0F1F3C',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <Link to="/auth/login">Login</Link>
      </p>
    </div>
  );
}

// Account Page
function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>My Account</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}!</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/style-lounge" element={<StyleLoungePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
