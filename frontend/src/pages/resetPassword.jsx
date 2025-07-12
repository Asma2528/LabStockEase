import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../provider/queries/Auth.query';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Use the resetPassword mutation hook
  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await resetPassword({ token, password }).unwrap();
      setMessage(response.message);
    } catch (error) {
      console.log(error)
      setError(error?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-blue-100'>
      <div className="wd-[95%] md:wd-[70%] lg:w-1/3 shadow-md rounded-md pt-10 pb-3 px-4 bg-white">
        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 py-1">
            <label htmlFor="password" className='block text-sm font-medium text-gray-700'>New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full outline-none py-3 px-2 border-[.1px] border-zinc-400 rounded-lg'
              placeholder='Enter New Password'
              autoComplete='new-password'
            />
          </div>
          <div className="mb-3 py-1 flex items-center justify-center">
            <Button className='w-full bg-blue-900 text-white py-3 px-2 flex items-center justify-center' type="submit">
              Reset Password
            </Button>
          </div>
          {message && <p className="text-center text-green-500 text-sm">{message}</p>}
          {error && <p className="text-center text-red-500 text-sm">{error}</p>}
        </form>
        <div className="mb-3 py-1 flex items-center justify-end">
              <p className="inline-flex items-center gap-x-1"><Link className='font-semibold text-blue-900' to={'/login'}>Login Now</Link></p>
            </div>
      </div>
    </div>
  );
};

export default ResetPassword;
