
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Book, 
  Users, 
  Award, 
  Globe, 
  Heart,
  Star,
  Target,
  Eye
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <Book className="h-6 w-6" />,
      title: "Islamic Education Excellence",
      description: "Providing authentic Islamic education based on Quran and Sunnah with modern pedagogical methods."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Building",
      description: "Fostering a strong Muslim community through education, mutual support, and shared values."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Accessibility",
      description: "Making Islamic education accessible to Muslims worldwide through innovative online platforms."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Spiritual Development",
      description: "Nurturing both intellectual growth and spiritual development in our students."
    }
  ];

  const staff = [
    {
      name: "Dr. Abdullah Hassan",
      role: "Principal & Islamic Studies Director",
      qualifications: "PhD Islamic Studies, Al-Azhar University",
      experience: "15+ years"
    },
    {
      name: "Ustaza Aisha Rahman",
      role: "Quran & Tajweed Specialist",
      qualifications: "Ijazah in Quran, Huffaz Certificate",
      experience: "12+ years"
    },
    {
      name: "Dr. Omar Al-Mansouri",
      role: "Arabic Language Director",
      qualifications: "PhD Arabic Literature, Damascus University",
      experience: "18+ years"
    },
    {
      name: "Sheikh Khalid Ibrahim",
      role: "Hadith & Fiqh Instructor",
      qualifications: "MA Islamic Jurisprudence, Medina University",
      experience: "20+ years"
    }
  ];

  const achievements = [
    { number: "18,000+", label: "Students Graduated" },
    { number: "50+", label: "Countries Reached" },
    { number: "500+", label: "Certified Huffaz" },
    { number: "25+", label: "Years of Excellence" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            About Our Madrasah
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Established with the mission to provide authentic Islamic education to Muslims worldwide, 
            our institution combines traditional Islamic scholarship with modern educational technology.
          </p>
          <Badge className="text-lg px-6 py-2 bg-emerald-100 text-emerald-700">
            Est. 1999 - 25 Years of Islamic Education Excellence
          </Badge>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To provide comprehensive Islamic education that nurtures both the spiritual and intellectual 
                  development of our students, preparing them to be confident Muslims who contribute positively 
                  to their communities while maintaining strong Islamic values and identity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To be the leading global institution for Islamic education, recognized for our innovative 
                  teaching methods, authentic scholarship, and the exceptional character of our graduates 
                  who serve as ambassadors of Islam in their communities worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do in our pursuit of Islamic education excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    {value.icon}
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Achievements</h2>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Alhamdulillah, by Allah's grace, we have been blessed to achieve these milestones 
              in our journey of Islamic education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-400">
                  {achievement.number}
                </div>
                <div className="text-emerald-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Faculty */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Distinguished Faculty</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from qualified Islamic scholars and experienced educators who are dedicated 
              to your spiritual and academic growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {staff.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-emerald-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">{member.qualifications}</p>
                    <Badge variant="secondary" className="text-xs">
                      {member.experience}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Our History</h2>
              <p className="text-gray-600">
                A journey of dedication to Islamic education spanning over two decades.
              </p>
            </div>
            
            <div className="space-y-8">
              <Card className="border-l-4 border-emerald-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 text-emerald-600 rounded-full p-2">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">1999 - Foundation</h3>
                      <p className="text-gray-600">
                        Our madrasah was established by a group of dedicated Islamic scholars with the vision 
                        of providing authentic Islamic education using traditional methods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-emerald-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 text-emerald-600 rounded-full p-2">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">2010 - Digital Transformation</h3>
                      <p className="text-gray-600">
                        We embraced technology to reach Muslims worldwide, launching our online learning platform 
                        and becoming one of the first digital Islamic institutions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-emerald-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 text-emerald-600 rounded-full p-2">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">2024 - Present</h3>
                      <p className="text-gray-600">
                        Today, we continue to innovate and expand our offerings while maintaining our commitment 
                        to authentic Islamic education, serving thousands of students across 50+ countries.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
