import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../config/api";

const SignupForm = ({ onSignupSuccess, onSignIn }) => {
  const { shouldShowAuthElements, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("تم إنشاء الحساب بنجاح!");
      onSignupSuccess(formData);
    }, 2000);
  };

  const socialSignup = (platform) => {
    // OAuth integration now handled by onClick events
    console.log(`${platform} OAuth integration active`);
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="flex w-full h-full max-w-[1920px] max-h-[1300px]">
        {/* Left Side - Enhanced Background */}
        <div className="flex-1 relative max-lg:hidden slide-in-left">
          <div className="w-full h-full bg-gradient-to-br from-[#0F123B] via-[#1a1f4d] to-[#020515] relative overflow-hidden">
            {/* Floating Orbs */}
            <div
              className="floating-orb w-96 h-96 top-10 -left-20"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="floating-orb w-64 h-64 bottom-20 -right-10"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="floating-orb w-32 h-32 top-1/3 right-1/4"
              style={{ animationDelay: "4s" }}
            ></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-[#0F123B]/60 to-transparent">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-[#A0AEC0] text-[20px] font-normal tracking-[3.6px] mb-[16px] fade-in">
                  INSPIRED BY THE FUTURE:
                </div>
                <div className="text-[36px] font-bold tracking-[6.48px] gradient-text fade-in relative">
                  KNOUX FINDR SEARCH
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#0075FF] to-transparent"></div>
                </div>
                <div
                  className="mt-8 text-[#A0AEC0] text-[14px] max-w-md mx-auto fade-in"
                  style={{ animationDelay: "0.5s" }}
                >
                  The most powerful local file search engine with AI-powered
                  organization
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Form */}
        <div className="flex-1 flex items-center justify-center p-[24px] max-lg:w-full slide-in-right">
          <div className="w-full max-w-[453px]">
            {/* Enhanced Header */}
            <div className="mb-[24px] max-lg:text-center fade-in">
              <div className="text-[14px] font-normal tracking-[2.52px] gradient-text mb-[26px]">
                KNOUX FINDR
              </div>

              {/* Dynamic Navigation Tabs - Hide Dashboard/Profile when not authenticated */}
              <div className="flex justify-center items-center mb-[70px] max-lg:justify-center max-lg:gap-[20px]">
                <div className="flex gap-[12px] max-lg:flex-wrap max-lg:justify-center p-2 glass-card rounded-2xl">
                  {/* Only show Dashboard and Profile buttons if user is authenticated */}
                  {isAuthenticated && (
                    <>
                      <div className="nav-tab flex items-center justify-center gap-[6px] h-[32px] px-[12px] rounded-[14px] glass-button cursor-pointer group">
                        <svg
                          className="w-[12px] h-[12px] group-hover:scale-110 transition-transform"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <g clipPath="url(#clip0)">
                            <path
                              d="M10.2225 3.6231C10.2354 3.61554 10.2462 3.6047 10.2537 3.59168C10.2612 3.57865 10.2651 3.56389 10.2651 3.54888C10.2651 3.53386 10.2612 3.5191 10.2537 3.50608C10.2462 3.49305 10.2354 3.48221 10.2225 3.47465L6.94095 1.56812C6.73098 1.44642 6.4926 1.38232 6.24991 1.38232C6.00722 1.38232 5.76883 1.44642 5.55886 1.56812L2.27798 3.47465C2.26501 3.48221 2.25425 3.49305 2.24677 3.50608C2.23929 3.5191 2.23535 3.53386 2.23535 3.54888C2.23535 3.56389 2.23929 3.57865 2.24677 3.59168C2.25425 3.6047 2.26501 3.61554 2.27798 3.6231L6.20704 5.93439C6.22026 5.94218 6.23532 5.94628 6.25066 5.94628C6.266 5.94628 6.28105 5.94218 6.29427 5.93439L10.2225 3.6231Z"
                              fill="white"
                            />
                            <path
                              d="M1.91016 4.20738C1.89705 4.19981 1.88218 4.19584 1.86705 4.19586C1.85192 4.19589 1.83706 4.19991 1.82398 4.20751C1.8109 4.21512 1.80006 4.22605 1.79256 4.23919C1.78505 4.25233 1.78115 4.26722 1.78125 4.28236V8.01827C1.78158 8.19831 1.82903 8.37512 1.91888 8.53112C2.00874 8.68713 2.13787 8.81689 2.29344 8.90751L5.77735 10.9964C5.7904 11.004 5.80521 11.0079 5.82029 11.0079C5.83537 11.008 5.85018 11.004 5.86325 10.9965C5.87631 10.9889 5.88716 10.9781 5.89471 10.965C5.90225 10.952 5.90624 10.9372 5.90625 10.9221V6.58763C5.90624 6.57256 5.90226 6.55776 5.89472 6.54471C5.88717 6.53166 5.87633 6.52083 5.86328 6.51329L1.91016 4.20738Z"
                              fill="white"
                            />
                            <path
                              d="M6.59375 6.60272V10.9211C6.59377 10.9362 6.59775 10.951 6.6053 10.964C6.61285 10.9771 6.6237 10.9879 6.63676 10.9954C6.64982 11.003 6.66463 11.0069 6.67971 11.0069C6.69479 11.0069 6.7096 11.003 6.72266 10.9954L10.2063 8.90649C10.3618 8.81599 10.4909 8.68641 10.5808 8.53061C10.6706 8.37481 10.7182 8.1982 10.7187 8.01833V4.28241C10.7187 4.26735 10.7147 4.25257 10.7071 4.23955C10.6996 4.22653 10.6887 4.21572 10.6756 4.20822C10.6626 4.20071 10.6478 4.19676 10.6327 4.19678C10.6177 4.19679 10.6029 4.20076 10.5898 4.20829L6.63672 6.5286C6.6237 6.53612 6.61288 6.54692 6.60534 6.55993C6.5978 6.57293 6.5938 6.58769 6.59375 6.60272Z"
                              fill="white"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0">
                              <rect
                                width="11"
                                height="11"
                                fill="white"
                                transform="translate(0.75 0.695251)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        <div className="text-white text-[11px] font-bold group-hover:text-[#0075FF] transition-colors">
                          DASHBOARD
                        </div>
                      </div>

                      <div className="nav-tab flex items-center justify-center gap-[6px] h-[32px] px-[12px] rounded-[14px] glass-button cursor-pointer group">
                        <svg
                          className="w-[12px] h-[12px] group-hover:scale-110 transition-transform"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <g clipPath="url(#clip1)">
                            <path
                              d="M7.89658 2.08253C7.4785 1.63114 6.89455 1.38257 6.25002 1.38257C5.60205 1.38257 5.01617 1.62964 4.60002 2.07823C4.17936 2.53177 3.9744 3.14815 4.02252 3.81374C4.11791 5.12686 5.11715 6.19507 6.25002 6.19507C7.38289 6.19507 8.38041 5.12708 8.47731 3.81417C8.52607 3.1546 8.31982 2.5395 7.89658 2.08253Z"
                              fill="white"
                            />
                            <path
                              d="M10.0314 11.0071H2.46887C2.36989 11.0084 2.27186 10.9876 2.18192 10.9462C2.09198 10.9048 2.01239 10.8439 1.94895 10.768C1.8093 10.601 1.75301 10.3731 1.79469 10.1425C1.97602 9.13665 2.54192 8.29167 3.43137 7.69849C4.22157 7.1719 5.22252 6.88208 6.25012 6.88208C7.27772 6.88208 8.27867 7.17212 9.06887 7.69849C9.95832 8.29145 10.5242 9.13643 10.7055 10.1423C10.7472 10.3729 10.6909 10.6008 10.5513 10.7677C10.4879 10.8438 10.4083 10.9047 10.3184 10.9461C10.2284 10.9875 10.1304 11.0083 10.0314 11.0071Z"
                              fill="white"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip1">
                              <rect
                                width="11"
                                height="11"
                                fill="white"
                                transform="translate(0.75 0.695251)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        <div className="text-white text-[11px] font-bold group-hover:text-[#0075FF] transition-colors">
                          PROFILE
                        </div>
                      </div>
                    </>
                  )}

                  {/* Show auth buttons only when not authenticated */}
                  {shouldShowAuthElements() && (
                    <>
                      <div className="nav-tab flex items-center justify-center gap-[6px] h-[32px] px-[12px] rounded-[14px] primary-button pulse-glow relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <svg
                          className="w-[12px] h-[12px] relative z-10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M5.75 1.72595C3.28596 1.72595 1.28125 3.73066 1.28125 6.1947C1.28125 8.65874 3.28596 10.6635 5.75 10.6635C8.21404 10.6635 10.2187 8.65874 10.2187 6.1947C10.2187 3.73066 8.21404 1.72595 5.75 1.72595ZM4.67105 4.23576C4.94326 3.94722 5.32633 3.78845 5.75 3.78845C6.17367 3.78845 6.5533 3.9483 6.82658 4.23833C7.10351 4.53224 7.23822 4.92712 7.20643 5.35165C7.14283 6.1947 6.48971 6.8822 5.75 6.8822C5.01029 6.8822 4.35588 6.1947 4.29357 5.35144C4.26199 4.92347 4.39648 4.5273 4.67105 4.23576ZM5.75 9.97595C5.24522 9.97628 4.74551 9.87525 4.2805 9.67884C3.8155 9.48243 3.39467 9.19465 3.04297 8.83255C3.2444 8.5453 3.50105 8.30106 3.79793 8.11412C4.34557 7.76306 5.03865 7.5697 5.75 7.5697C6.46135 7.5697 7.15443 7.76306 7.70143 8.11412C7.99855 8.30098 8.25543 8.54522 8.45703 8.83255C8.10536 9.19469 7.68454 9.4825 7.21953 9.67891C6.75451 9.87532 6.25479 9.97633 5.75 9.97595Z"
                            fill="white"
                          />
                        </svg>
                        <div className="text-white text-[11px] font-bold relative z-10">
                          SIGN UP
                        </div>
                      </div>

                      <div
                        className="nav-tab flex items-center justify-center gap-[6px] h-[32px] px-[12px] rounded-[14px] glass-button cursor-pointer group"
                        onClick={onSignIn}
                      >
                        <svg
                          className="w-[12px] h-[12px] group-hover:scale-110 transition-transform"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M5.43623 4.28716C5.43623 4.56646 5.43623 4.83716 5.52432 5.09068C4.59834 6.17778 2.15342 9.05025 1.92568 9.26939C1.88042 9.31 1.84421 9.35968 1.81941 9.4152C1.79461 9.47072 1.78178 9.53084 1.78174 9.59165C1.78174 9.77427 1.89346 9.95044 1.98799 10.0493C2.12979 10.1975 2.73564 10.7583 2.84736 10.6508C3.17822 10.3286 3.24482 10.2426 3.38018 10.1094C3.58428 9.90962 3.35869 9.50142 3.42959 9.33599C3.50049 9.17056 3.57568 9.13833 3.69814 9.11255C3.82061 9.08677 4.0376 9.17485 4.20732 9.177C4.38564 9.17915 4.48232 9.10396 4.61553 8.97935C4.72295 8.88052 4.80029 8.78814 4.80244 8.64419C4.80674 8.45083 4.52744 8.19517 4.73584 7.99107C4.94424 7.78696 5.24502 8.12427 5.46631 8.09849C5.6876 8.07271 5.95615 7.76548 5.98408 7.63443C6.01201 7.50337 5.73271 7.16607 5.77568 6.97485C5.79072 6.9104 5.92178 6.76001 6.02061 6.73853C6.11943 6.71704 6.55771 6.88677 6.65654 6.86528C6.77685 6.8395 6.9165 6.71275 7.03037 6.64185C7.36338 6.78579 7.66631 6.8438 8.05518 6.8438C9.52685 6.8438 10.7192 5.69654 10.7192 4.28286C10.7192 2.86919 9.52685 1.72687 8.05518 1.72687C6.5835 1.72687 5.43623 2.87349 5.43623 4.28716ZM9.34424 3.78937C9.34424 3.92534 9.30392 4.05826 9.22837 4.17132C9.15283 4.28438 9.04546 4.3725 8.91983 4.42453C8.79421 4.47657 8.65597 4.49018 8.52261 4.46366C8.38925 4.43713 8.26675 4.37165 8.1706 4.2755C8.07445 4.17935 8.00898 4.05685 7.98245 3.92349C7.95592 3.79013 7.96954 3.6519 8.02157 3.52627C8.07361 3.40065 8.16172 3.29328 8.27478 3.21773C8.38784 3.14219 8.52076 3.10187 8.65674 3.10187C8.83907 3.10187 9.01394 3.1743 9.14287 3.30323C9.2718 3.43216 9.34424 3.60703 9.34424 3.78937Z"
                            fill="white"
                          />
                        </svg>
                        <div className="text-white text-[11px] font-bold group-hover:text-[#0075FF] transition-colors">
                          SIGN IN
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center w-[160px] h-[40px] px-[12px] rounded-[16px] primary-button max-lg:w-[130px] cursor-pointer group relative overflow-hidden form-glow">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="text-white text-[11px] font-bold relative z-10 group-hover:scale-105 transition-transform">
                    Free Download
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Form Container */}
            <div className="w-full max-w-[453px] h-[714px] relative fade-in">
              <div className="absolute inset-0 rounded-[32px] glass-card form-glow">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-[#0075FF]/30 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-24 h-24 bg-gradient-to-tl from-[#0075FF]/20 to-transparent rounded-full blur-2xl"></div>

                <div className="relative p-[48px] h-full flex flex-col z-10">
                  {/* Welcome Header */}
                  <div className="text-center mb-[48px]">
                    <div className="text-white text-[30px] font-bold mb-[12px]">
                      Welcome!
                    </div>
                    <div className="text-white text-[14px] font-normal leading-[24px]">
                      Use these awesome forms to login or create new account in
                      your project for free.
                    </div>
                  </div>

                  {/* Enhanced Social Registration */}
                  <div className="mb-[48px]">
                    <div className="text-center mb-[24px]">
                      <div className="text-white text-[18px] font-bold mb-[47px]">
                        Register with
                      </div>
                      <div className="grid grid-cols-3 gap-[12px] mb-[47px] max-w-[280px] mx-auto">
                        {/* Facebook */}
                        <div
                          className="w-[75px] h-[75px] rounded-[20px] glass-button flex items-center justify-center cursor-pointer group relative overflow-hidden"
                          onClick={() =>
                            window.open(API_ENDPOINTS.OAUTH_FACEBOOK, "_blank")
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <svg
                            className="w-[28px] h-[28px] group-hover:scale-110 transition-transform relative z-10"
                            viewBox="0 0 31 32"
                            fill="none"
                          >
                            <g clipPath="url(#clip2)">
                              <path
                                d="M28.4163 16C28.4163 8.86998 22.6297 3.08331 15.4997 3.08331C8.36967 3.08331 2.58301 8.86998 2.58301 16C2.58301 22.2516 7.02634 27.4571 12.9163 28.6583V19.875H10.333V16H12.9163V12.7708C12.9163 10.2779 14.9443 8.24998 17.4372 8.24998H20.6663V12.125H18.083C17.3726 12.125 16.7913 12.7062 16.7913 13.4166V16H20.6663V19.875H16.7913V28.8521C23.3143 28.2062 28.4163 22.7037 28.4163 16Z"
                                fill="white"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip2">
                                <rect
                                  width="31"
                                  height="31"
                                  fill="white"
                                  transform="translate(0 0.5)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>

                        {/* Apple */}
                        <div
                          className="w-[75px] h-[75px] rounded-[20px] glass-button flex items-center justify-center cursor-pointer group relative overflow-hidden"
                          onClick={() =>
                            window.open(API_ENDPOINTS.OAUTH_APPLE, "_blank")
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <svg
                            className="w-[28px] h-[28px] group-hover:scale-110 transition-transform relative z-10"
                            viewBox="0 0 31 32"
                            fill="none"
                          >
                            <path
                              d="M21.1384 8.78461C18.6972 8.78461 17.6654 9.94953 15.9653 9.94953C14.2221 9.94953 12.8925 8.79308 10.777 8.79308C8.70632 8.79308 6.49818 10.0573 5.09591 12.211C3.12693 15.248 3.46114 20.9678 6.65015 25.8407C7.79085 27.585 9.31421 29.5413 11.3123 29.5625H11.3486C13.0851 29.5625 13.6009 28.4254 15.9907 28.4121H16.027C18.3811 28.4121 18.8534 29.5558 20.5826 29.5558H20.6189C22.617 29.5346 24.2221 27.367 25.3628 25.6294C26.1838 24.3797 26.4889 23.7524 27.1186 22.3386C22.5056 20.5876 21.7645 14.0479 26.3267 11.5407C24.9341 9.79695 22.9772 8.78703 21.1324 8.78703L21.1384 8.78461Z"
                              fill="white"
                            />
                            <path
                              d="M20.6008 2.43903C19.1477 2.53772 17.4524 3.46287 16.4594 4.67078C15.5585 5.76547 14.8174 7.38934 15.108 8.96416H15.2243C16.7719 8.96416 18.3558 8.03235 19.2809 6.83836C20.1722 5.7019 20.8479 4.09135 20.6008 2.43903Z"
                              fill="white"
                            />
                          </svg>
                        </div>

                        {/* Google */}
                        <div
                          className="w-[75px] h-[75px] rounded-[20px] glass-button flex items-center justify-center cursor-pointer group relative overflow-hidden"
                          onClick={() =>
                            window.open(API_ENDPOINTS.OAUTH_GOOGLE, "_blank")
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <svg
                            className="w-[22px] h-[22px] group-hover:scale-110 transition-transform relative z-10"
                            viewBox="0 0 25 24"
                            fill="none"
                          >
                            <path
                              d="M22.6794 10.3817L22.5734 9.93222H12.8028V14.0675H18.6406C18.0345 16.9457 15.222 18.4607 12.9247 18.4607C11.2531 18.4607 9.49109 17.7575 8.32484 16.6274C7.70953 16.0216 7.21974 15.3004 6.88353 14.505C6.54731 13.7097 6.37126 12.8558 6.36547 11.9924C6.36547 10.2505 7.14828 8.50816 8.28734 7.36206C9.4264 6.21597 11.1467 5.57472 12.8572 5.57472C14.8161 5.57472 16.22 6.61488 16.745 7.08925L19.6836 4.16613C18.8216 3.40863 16.4534 1.49988 12.7625 1.49988C9.91484 1.49988 7.18437 2.59066 5.18844 4.58003C3.21875 6.53894 2.19922 9.37159 2.19922 11.9999C2.19922 14.6282 3.16391 17.3192 5.07266 19.2936C7.11219 21.3992 10.0006 22.4999 12.9748 22.4999C15.6809 22.4999 18.2459 21.4396 20.0741 19.5158C21.8712 17.6221 22.8008 15.0017 22.8008 12.2549C22.8008 11.0985 22.6845 10.4117 22.6794 10.3817Z"
                              fill="white"
                            />
                          </svg>
                        </div>

                        {/* GitHub */}
                        <div
                          className="w-[75px] h-[75px] rounded-[20px] glass-button flex items-center justify-center cursor-pointer group relative overflow-hidden"
                          onClick={() =>
                            window.open(API_ENDPOINTS.OAUTH_GITHUB, "_blank")
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <svg
                            className="w-[28px] h-[28px] group-hover:scale-110 transition-transform relative z-10"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </div>

                        {/* Microsoft */}
                        <div
                          className="w-[75px] h-[75px] rounded-[20px] glass-button flex items-center justify-center cursor-pointer group relative overflow-hidden"
                          onClick={() =>
                            window.open(
                              "http://localhost:3001/auth/microsoft",
                              "_blank",
                            )
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00BCF2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <svg
                            className="w-[26px] h-[26px] group-hover:scale-110 transition-transform relative z-10"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path d="M11.4 0H0v11.4h11.4V0z" fill="#f25022" />
                            <path d="M24 0H12.6v11.4H24V0z" fill="#7fba00" />
                            <path
                              d="M11.4 12.6H0V24h11.4V12.6z"
                              fill="#00a4ef"
                            />
                            <path
                              d="M24 12.6H12.6V24H24V12.6z"
                              fill="#ffb900"
                            />
                          </svg>
                        </div>

                        {/* LinkedIn */}
                        <div
                          className="w-[75px] h-[75px] rounded-[20px] glass-button flex items-center justify-center cursor-pointer group relative overflow-hidden opacity-50"
                          title="Coming Soon"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0077B5]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <svg
                            className="w-[26px] h-[26px] group-hover:scale-110 transition-transform relative z-10"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-[#A0AEC0] text-[18px] font-bold text-center">
                        or
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Form Fields */}
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-[24px] mb-[24px]"
                  >
                    <div>
                      <div className="text-white text-[14px] font-normal mb-[5px]">
                        Name
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full h-[50px] px-[20px] rounded-[20px] glass-card text-white placeholder-[#A0AEC0] text-[14px] focus:outline-none focus:border-[#0075FF] transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <div className="text-white text-[14px] font-normal mb-[5px]">
                        Email
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your email address"
                        className="w-full h-[50px] px-[20px] rounded-[20px] glass-card text-white placeholder-[#A0AEC0] text-[14px] focus:outline-none focus:border-[#0075FF] transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <div className="text-white text-[14px] font-normal mb-[5px]">
                        Password
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Your password"
                          className="w-full h-[50px] px-[20px] pr-[50px] rounded-[20px] glass-card text-white placeholder-[#A0AEC0] text-[14px] focus:outline-none focus:border-[#0075FF] transition-all duration-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-[15px] top-1/2 transform -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors"
                        >
                          {!showPassword ? (
                            <svg
                              className="w-[20px] h-[20px]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-[20px] h-[20px]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Enhanced Remember Me Toggle */}
                  <div className="flex items-center gap-[12px] mb-[24px]">
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className="w-[36px] h-[19px] rounded-full cursor-pointer transition-all duration-300 relative"
                      style={{ background: rememberMe ? "#0075FF" : "#4A5568" }}
                    >
                      <div
                        className="w-[13.5px] h-[13.5px] bg-white rounded-full absolute transition-all duration-300 shadow-md"
                        style={{
                          transform: rememberMe
                            ? "translateX(19.75px) translateY(2.75px) scale(1.1)"
                            : "translateX(2.75px) translateY(2.75px) scale(1)",
                        }}
                      />
                    </div>
                    <div className="text-white text-[12px] font-normal">
                      Remember me
                    </div>
                  </div>

                  {/* Enhanced Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-[45px] rounded-[12px] primary-button text-white text-[10px] font-bold tracking-wider flex items-center justify-center gap-[8px] transition-all duration-300 relative overflow-hidden group"
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    {isLoading && <div className="loading-spinner" />}
                    <span className="relative z-10">
                      {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
                    </span>
                  </button>

                  {/* Enhanced Sign In Link */}
                  <div className="text-center mt-[24px]">
                    <span className="text-[#A0AEC0] text-[14px] font-normal">
                      Already have an account?{" "}
                    </span>
                    <span
                      className="text-white text-[14px] font-bold cursor-pointer hover:text-[#0075FF] transition-colors relative group"
                      onClick={onSignIn}
                    >
                      Sign in
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0075FF] group-hover:w-full transition-all duration-300"></div>
                    </span>
                  </div>

                  {/* Professor Attribution - Moved to bottom */}
                  <div className="glass-card rounded-lg p-3 mt-8 border border-amber-500/30 bg-amber-500/5">
                    <div
                      className="text-amber-400 font-bold tracking-wider text-center"
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontStyle: "italic",
                        fontSize: "14px",
                      }}
                    >
                      Powered by Prof. Sadek Elgazar
                    </div>
                    <div className="text-xs text-amber-300/80 mt-1 text-center">
                      AI Research Director & Project Supervisor
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
