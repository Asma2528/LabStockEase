import { useState } from 'react';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../provider/queries/Auth.query'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { error, isLoading, isSuccess }] = useForgotPasswordMutation();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword({ email }).unwrap();
      // If the request is successful, clear any error and show a success message
      setMessage(response.message || 'Check your email for password reset instructions');
    } catch (err) {
      console.error('Error Response:', err);
      // Capture and log specific server error
      if (err.data) {
        // The request was made, and the server responded with a status code outside the 2xx range
        console.error('Server Error:', err.data);
        setMessage(err.data.error || 'Something went wrong. Please try again.');
      } else {
        // Something else happened in making the request that triggered an error
        console.error('Error:', err.message);
        setMessage('An unknown error occurred. Please try again.');
      }
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-blue-100'>
      <div className="wd-[95%] md:wd-[70%] lg:w-1/3 shadow-md rounded-md pt-10 pb-3 px-4 bg-white">
        <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 py-1">
            <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full outline-none py-3 px-2 border-[.1px] border-zinc-400 rounded-lg'
              placeholder='Enter Email Address'
              autoComplete='email'
            />
          </div>
          <div className="mb-3 py-1 flex items-center justify-center">
            <Button 
              className='w-full bg-blue-900 text-white py-3 px-2 flex items-center justify-center' 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Submit'}
            </Button>
          </div>
          {isSuccess && <p className="text-center text-green-500 text-sm">{message}</p>}
          {error && <p className="text-center text-red-500 text-sm">{message}</p>}
        </form>
        <div className="mb-3 py-1 flex items-center justify-end">
          <p className="inline-flex items-center gap-x-1">Remember your password? <Link className='font-semibold text-blue-900' to={'/login'}>Login Here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
