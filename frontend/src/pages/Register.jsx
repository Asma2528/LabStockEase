import { ErrorMessage, Field, Formik } from 'formik';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useRegisterUserMutation } from '../provider/queries/Auth.query';
import { toast } from 'sonner';
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from 'react';

const Register = () => {
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const navigate = useNavigate();
  const RecaptchaRef = useRef();

  const initialValues = {
    token: '',
    name: '',
    email: '',
    password: '',
    roles: [], // Changed role to an array
  };

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Email must be valid").required("Email is required"),
    password: yup.string().min(5, "Password must be greater than 5 characters").required("Password is required"),
    roles: yup.array().min(1, "At least one role is required").required("Role is required"),
  });

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Lab Assistant', value: 'lab-assistant' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Stores', value: 'stores' },
    { label: 'Manager', value: 'manager' },
    { label: 'Accountant', value: 'accountant' },
  ];

  const OnSubmitHandler = async (values, { resetForm }) => {
    console.log("Submitting Values:", values); // Debugging
    try {
      const {  error } = await registerUser(values);
      if (error) {
        const errorMessage = error.data?.message || "Registration failed";
        toast.error(`Registration error: ${errorMessage}`);
        return;
      }

      toast.success('User Registered Successfully');
      resetForm();
      navigate("/user");
    } catch (error) {
      toast.error(`Caught error: ${error.message || "Unknown error"}`);
    } finally {
      RecaptchaRef.current.reset();
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-blue-100'>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={OnSubmitHandler}
      >
        {({ handleSubmit, setFieldValue, values }) => (
          <form onSubmit={handleSubmit} className="wd-[90%] md:wd-[90%] lg:w-2/4 shadow-md rounded-md pt-4 pb-3 px-4 bg-white">
            <div className="mb-3 py-1">
              <label htmlFor="name">Name</label>
              <Field
                id='name'
                name='name'
                className='w-full outline-none py-2 px-2 border-[.1px] border-zinc-400 rounded-lg'
                placeholder='Enter Your Name'
                autoComplete='username'
              />
              <ErrorMessage component={'p'} className='text-red-500 text-sm' name='name' />
            </div>
            <div className="mb-3 py-1">
              <label htmlFor="email">Email</label>
              <Field
                id='email'
                name='email'
                type='email'
                className='w-full outline-none py-2 px-2 border-[.1px] border-zinc-400 rounded-lg'
                placeholder='Enter Email Address'
                autoComplete='email'
              />
              <ErrorMessage component={'p'} className='text-red-500 text-sm' name='email' />
            </div>
            <div className="mb-3 py-1">
              <label htmlFor="password">Password</label>
              <Field
                id='password'
                name='password'
                type='password'
                className='w-full outline-none py-2 px-2 border-[.1px] border-zinc-400 rounded-lg'
                placeholder='********'
                autoComplete='new-password'
              />
              <ErrorMessage component={'p'} className='text-red-500 text-sm' name='password' />
            </div>

            {/* MultiSelect for Roles */}
            <div className="mb-3 py-1">
              <label htmlFor="roles">Role</label>
              <MultiSelect
                id="roles"
                name="roles"
                value={values.roles}
                options={roleOptions}
                onChange={(e) => setFieldValue("roles", e.value)}
                className="w-full outline-none py-1 px-1 border-[.1px] border-zinc-400 rounded-lg"
                placeholder="Select Roles"
                display="chip"
              />
              <ErrorMessage component={'p'} className='text-red-500 text-sm' name='roles' />
            </div>

            <div className="pb-1">
              <ReCAPTCHA
                ref={RecaptchaRef}
                sitekey={import.meta.env.VITE_SITE_KEY}
                onChange={(token) => {
                  setFieldValue('token', token);
                }}
              />
            </div>
            <div className="mb-3 py-1 flex items-center justify-center">
              <Button
                disabled={!values.token}
                loading={isLoading}
                className='w-full bg-blue-900 text-white py-2 px-2 flex items-center justify-center'
                type="submit"
              >
                Register
              </Button>
            </div>
            <div className="mb-2 py-1 flex items-center justify-end">
              <p className="inline-flex items-center gap-x-1">Already Have An Account?<Link className='font-semibold text-blue-900' to={'/login'}>Login</Link></p>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default Register;
