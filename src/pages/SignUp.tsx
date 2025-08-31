import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Signup = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [emailValue, setEmailValue] = useState('')
  
  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmailValue(emailFromUrl)
    }
  }, [searchParams])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate email and invitation token
    if (!emailValue) {
      setError('No email provided in invitation link')
      setLoading(false)
      return
    }

    const inviteToken = searchParams.get('invitation_token')
    if (!inviteToken) {
      setError('Invalid invitation token')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      // Verify the invitation token and create the user
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: emailValue,
        token: inviteToken,
        type: 'signup'
      })

      if (verifyError) throw verifyError

      // Update the user's password and metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber
        }
      })

      if (updateError) throw updateError

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      // Create admin profile
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([{
          auth_user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: emailValue,
          phone_number: formData.phoneNumber,
          role: 'admin',
          status: 'Active'
        }] as any)

      if (profileError) throw profileError

      navigate('/admin')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Complete your profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({...prev, phoneNumber: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 block w-full text-gray-900 font-medium">
                {emailValue}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Creating account...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup