import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { apiService } from '../api/apiService';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    city: '',
    profession: '',
    adminCode: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const { setUser, register } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        setVerificationStep(true);
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiService.verifyEmail({ email: formData.email, token: otp });
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        navigate('/');
      } else {
        setError(result.message || 'Verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-gray-200">
        <div className="max-w-md w-full">
          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">
            {!verificationStep ? (
              <>
                {/* Registration Form */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-extrabold text-white">Join the Circus</h1>
                  <p className="text-gray-400 mt-2">Create your account to get started.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input w-full p-3 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input w-full p-3 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">City</label>
                    <input type="text" name="city" value={formData.city} placeholder="Enter your city" onChange={handleChange} className="form-input w-full p-3 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Role</label>
                    <select name="role" onChange={handleChange} value={formData.role} className="form-input w-full p-3 rounded-lg text-gray-200 bg-[rgba(10,25,40,0.5)]">
                      <option value="User">User</option>
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  {formData.role === 'Staff' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Profession</label>
                      <select name="profession" value={formData.profession} onChange={handleChange} className="form-input w-full p-3 rounded-lg text-gray-200 bg-[rgba(10,25,40,0.5)]">
                        <option value="">Select Profession</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Mechanic">Mechanic</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                  {formData.role === 'Admin' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Admin Code</label>
                      <input type="password" name="adminCode" value={formData.adminCode} placeholder="Enter secret admin code" onChange={handleChange} className="form-input w-full p-3 rounded-lg" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input w-full p-3 rounded-lg" />
                    <PasswordStrengthIndicator password={formData.password} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="form-input w-full p-3 rounded-lg" />
                  </div>
                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full btn-primary-gradient font-bold py-3 px-6 text-lg rounded-xl mt-4 transition-all disabled:bg-gray-500">
                    {loading ? 'Registering...' : 'Create Account'}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Verification Form */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-extrabold text-white">Verify Your Email</h1>
                  <p className="text-gray-400 mt-2">Enter the 6-digit code sent to {formData.email}.</p>
                </div>
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Verification Code</label>
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength="6"
                      className="form-input w-full p-3 rounded-lg text-center tracking-[1em]"
                    />
                  </div>
                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full btn-primary-gradient ...">
                    {loading ? 'Verifying...' : 'Verify and Login'}
                  </button>
                </form>
              </>
            )}
            <p className="text-center text-sm text-gray-400 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;
