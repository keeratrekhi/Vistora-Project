
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import Logo from '@/components/Logo';
// import MovingBackground from '@/components/MovingBackground';
// import PhoneAuth from '@/components/PhoneAuth';
// import { useDispatch, useSelector } from 'react-redux';
// import { SignUpFailure, SignUpStart,SignUpSuccess } from '@/redux/user/slice';


// const Signup: React.FC = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const dispatch=useDispatch();
//   const {loading,error}=useSelector((state:{
//     user:{
//     loading:boolean,
//     error:string|null
//     }
//   })=>state.user)
//   const [phoneNumber, setPhoneNumber] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     dispatch(SignUpStart());
    
//     if (formData.password !== formData.confirmPassword) {
//       dispatch(SignUpFailure('Passwords do not match'));
//       return;
//     }
    
//     if (!agreedToTerms) {
//       dispatch(SignUpFailure('You must agree to the terms and conditions'));
//       return;
//     }
    
    
//     try {
     
//       const res=await fetch("http://localhost:3000/api/auth/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: formData.username,
//           password: formData.password,
//           phoneNumber: phoneNumber,
//         }),
//       });
//       const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.error || "Signup failed");
//     }

//     dispatch(SignUpSuccess(data));
//     navigate("/dashboard");
      
//     } catch (err: any) {
//       dispatch(SignUpFailure(err.message));
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex flex-col md:flex-row">
//       {/* <MovingBackground /> */}
      
//       {/* Left Side - Form */}
//       <div className="w-full flex items-center justify-center p-8">
//         <div className="w-full max-w-md animate-fade-in">
//           <div className="text-center mb-8">
//             <Logo size="lg" />
//             <h1 className="text-2xl font-bold mt-6">Create your account</h1>
//             <p className="text-foreground/70 mt-2">Start managing your galleries today</p>
           
//           </div>
          
         
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {error && (
//               <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
//                 {error}
//               </div>
//             )}
            
//             <div className="space-y-2">
//               <Label htmlFor="username">Username</Label>
//               <Input
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 placeholder="John Doe"
//                 className="bg-secondary border-secondary"
//                 required
//               />
//             </div>
            
//             {/* <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="you@example.com"
//                 className="bg-secondary border-secondary"
//                 required
//               />
//             </div> */}
            
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="bg-secondary border-secondary"
//                 required
//               />
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm Password</Label>
//               <Input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="bg-secondary border-secondary"
//                 required
//               />
//             </div>

//             <div>
//          <PhoneAuth onVerified={(verifiedPhone: string) => setPhoneNumber(verifiedPhone)} />
//           </div>
            
//             <div className="flex items-center space-x-2">
//               <Checkbox 
//                 id="terms" 
//                 checked={agreedToTerms}
//                 onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
//               />
//               <label
//                 htmlFor="terms"
//                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 I agree to the{' '}
//                 <Link to="/terms" className="text-neon-purple hover:underline">
//                   terms and conditions
//                 </Link>
//               </label>
//             </div>
            
//             <Button 
//               type="submit" 
//               className="w-full bg-neon-purple hover:bg-neon-purple/90 mt-4"
//               disabled={loading}
//             >
//               {loading ? 'Creating Account...' : 'Sign Up'}
//             </Button>
            
//             <div className="text-center text-sm">
//               Already have an account?{' '}
//               <Link to="/login" className="text-neon-purple hover:underline">
//                 Log in
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;
