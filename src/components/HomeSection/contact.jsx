import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@appointmenthub.com',
      link: 'mailto:support@appointmenthub.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: '123 Service Street, Tech City, TC 12345'
    }
  ];

  return (
    <section id="contact" className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Decorative elements - responsive */}
      <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-auto">
        {/* Header - Responsive */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            Get In <span className="text-orange-400">Touch</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-2 md:px-0">
            Have a question or need assistance? We'd love to hear from you. Reach out and our team will respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 w-full">
          {/* Contact Info Cards */}
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <a
                key={index}
                href={info.link || '#'}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 w-full h-full"
              >
                <div className="mb-4 inline-block p-3 md:p-4 bg-orange-600/20 rounded-xl group-hover:bg-orange-600/30 transition-all duration-300">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-white group-hover:text-orange-300 transition-colors duration-300">
                  {info.title}
                </h3>
                <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {info.value}
                </p>
              </a>
            );
          })}
        </div>

        {/* Contact Form - Responsive */}
        <div className="w-full pb-8 md:pb-12">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            {submitted && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/20 border border-green-500/50 rounded-lg md:rounded-xl">
                <p className="text-green-400 font-semibold text-xs sm:text-sm md:text-base">Thank you! Your message has been sent successfully.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Left Column - Name, Email, Subject */}
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full">
                {/* Name Field */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-300">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-gray-500 transition-all duration-300 text-xs sm:text-sm md:text-base"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-gray-500 transition-all duration-300 text-xs sm:text-sm md:text-base"
                    required
                  />
                </div>

                {/* Subject Field */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-300">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-gray-500 transition-all duration-300 text-xs sm:text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Right Column - Message Field */}
              <div className="flex flex-col w-full md:row-span-3">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-300">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your message..."
                  className="w-full flex-1 min-h-48 sm:min-h-56 md:min-h-[280px] px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-gray-500 transition-all duration-300 resize-none text-xs sm:text-sm md:text-base"
                  required
                ></textarea>
              </div>

              {/* Submit Button - Full Width */}
              <button
                type="submit"
                className="w-full md:col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base"
              >
                <Send size={18} />
                Send Message
              </button>
            </form>

            <p className="text-center text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6">
              We'll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
