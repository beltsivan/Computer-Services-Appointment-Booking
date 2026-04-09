import { CheckCircle, Users, Zap, Shield } from 'lucide-react';

export const About = () => {
  const features = [
    {
      icon: CheckCircle,
      title: 'Easy Booking',
      description: 'Schedule appointments in seconds with our intuitive booking system'
    },
    {
      icon: Users,
      title: 'Professional Team',
      description: 'Connect with experienced professionals dedicated to your satisfaction'
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Get immediate confirmation and reminders for your appointments'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            About <span className="text-orange-400">AppointmentHub</span>
          </h2>
          <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto">
            At Store Name, we believe tech support should be as fast as the computers we fix. By moving away from traditional 
            logbooks to our streamlined Appointment Booking System, we ensure that your 
            service is prioritized, organized, and expert-led.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-orange-500 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 transform hover:-translate-y-2"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-orange-600/0 group-hover:from-orange-600/10 group-hover:to-orange-600/5 rounded-2xl transition-all duration-500"></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-block p-3 bg-orange-600/20 rounded-xl group-hover:bg-orange-600/30 transition-all duration-500">
                    <Icon className="w-8 h-8 text-orange-400 group-hover:text-orange-300 transition-colors duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-orange-300 transition-colors duration-500">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500">
                    {feature.description}
                  </p>
                </div>

                {/* Border animation on hover */}
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-orange-500/50 transition-all duration-500"></div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: '10K+', label: 'Happy Users' },
            { number: '50K+', label: 'Appointments Booked' },
            { number: '500+', label: 'Professionals' }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-2xl border border-orange-600/30 hover:border-orange-400 transition-all duration-500 group hover:shadow-lg hover:shadow-orange-500/20"
            >
              <p className="text-5xl md:text-6xl font-bold text-orange-400 mb-2 group-hover:text-orange-300 transition-colors duration-500">
                {stat.number}
              </p>
              <p className="text-gray-300 text-lg group-hover:text-white transition-colors duration-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
