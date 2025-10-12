import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api/apiService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await apiService.forgotPassword({ email });
      if (result.success) {
        setMessage(result.message);
        navigate('/reset-password', { state: { email } });
      } else {
        setError(result.message || 'Failed to send reset code.');
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white">Forgot Password</h1>
            <p className="text-gray-400 mt-2">Enter your email to receive a reset link.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input w-full p-3 rounded-lg text-base"
              />
            </div>
            {message && <p className="text-green-400 text-sm text-center">{message}</p>}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div>
              <button type="submit" disabled={loading} className="w-full btn-primary-gradient font-bold py-3 px-6 text-lg rounded-xl mt-4 transition-all disabled:bg-gray-500">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
