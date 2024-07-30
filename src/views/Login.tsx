'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { OverridableStringUnion } from '@mui/types'
import { AlertColor, AlertPropsColorOverrides } from '@mui/material'
import { signInUser } from '@/services/auth'
import CustomToast from '@/components/CustomToast'
import Cookies from 'js-cookie'
import LoadingButton from './LoadingButton'


export type ToastState = {
  show?: boolean;
  message: string;
  type: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>;
};
const Login = ({ mode }: { mode: Mode }) => {
  // States
  const pathname = usePathname()
  const router = useRouter();
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)


  useEffect(() => {
    // setLoading(true)
    Cookies.get("token") && router.push("/")
    // setLoading(false)
  }, [Cookies]);

  useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      // Prevent navigating back to previous pages after logout
      if (pathname !== '/authentication/login') {
        e.preventDefault(); // Prevent default behavior
        router.replace('/authentication/login'); // Redirect to login page
      }
    };
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [pathname]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToast = ({
    message = '',
    type = 'error',
  }: ToastState) => {
    setToast({
      show: true,
      message: message,
      type: type,
    });
    // setToast(prevToast => ({ ...prevToast, show: false }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validation
    // const emailError = !/^\S+@\S+\.\S+$/i.test(formData.email)
    //   ? "Invalid email address"
    //   : "";
    // const passwordError = formData.password.length < 8
    //   ? "Password should be at least 8 characters long"
    //   : "";

    // setError({ email: emailError, password: passwordError });

    // if (emailError || passwordError) return;

    setLoading(true);
    signInUser(formData).then((res) => {
      if (res?.status == 200) {
        handleToast({
          message: "Login successful",
          type: "success",
        })
        router.replace("/")
        console.log("res?.status", res?.status)

      }
      else if (res?.status == 400 || res?.status == 401) {
        handleToast({
          message: res?.error,
          type: "error",
        })
      }
      else {
        handleToast({
          message: "Something went wrong from server",
          type: "error",
        })
      }
      setLoading(false);
    }).catch(() => {
      handleToast({
        message: "Something went wrong from server",
        type: "error",
      })
      setLoading(false)
    });
  };




  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
              <Typography className='mbs-1'>Please sign-in to your account and start the adventure</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField autoFocus fullWidth label='Email' name='email' value={formData.email} onChange={handleChange} />
              <TextField
                fullWidth
                label='Password'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox />} label='Remember me' />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
              </div>
              {loading ?
                <LoadingButton size={20} />
                :
                <Button fullWidth variant='contained' type='submit'>
                  Log In
                </Button>
              }
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Create an account
                </Typography>
              </div>
              <Divider className='gap-3'>or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <CustomToast toast={toast} setToast={setToast} />
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Login
