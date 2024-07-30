'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

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
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { usePathname, useRouter } from 'next/navigation'
import { ToastState } from './Login'
// import Cookies from 'js-cookie'
import { registerUser } from '@/services/auth'
import { useCookie } from 'react-use'
import Cookies from 'js-cookie'
import { CircularProgress } from '@mui/material'
import { CustomCircularProgress } from '@/components/CustomCircularProgress'
import LoadingButton from './LoadingButton'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const pathname = usePathname()
  const router = useRouter();
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



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
    setLoading(true);
    registerUser(formData).then((res) => {
      console.log("res?.status", res?.status)
      if (res?.status == 200) {
        handleToast({
          message: "User Registered Successfully",
          type: "success",
        })
        router.replace("/")

      }
      else {
        handleToast({
          message: res?.error,
          type: "error",
        })
      }
      setLoading(false);
    }).catch((res) => {
      handleToast({
        message: res?.error,
        type: "error",
      })
      setLoading(false)
    });
  };

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField autoFocus fullWidth label='Username' name='username' value={formData.username} onChange={handleChange} />
              <TextField fullWidth label='Email' name='email' value={formData.email} onChange={handleChange} />
              <TextField
                fullWidth
                label='Password'
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
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
              {
                loading ?
                  <LoadingButton size={20} />
                  :
                  <Button fullWidth variant='contained' type='submit'>
                    Sign Up
                  </Button>
              }
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
              <Divider className='gap-3'>Or</Divider>
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
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
