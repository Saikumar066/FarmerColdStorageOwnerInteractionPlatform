import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Refrigerator, Users, Clock, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Refrigerator,
      title: "Modern Cold Storage",
      description:
        "State-of-the-art refrigeration facilities to keep your produce fresh",
    },
    {
      icon: Users,
      title: "Easy Booking",
      description: "Simple and quick booking process designed for farmers",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Round-the-clock monitoring and access to your stored goods",
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description:
        "Your produce is safe and secure in our monitored facilities",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-6">
            Professional Cold Storage
            <span className="block text-green-800">for Farmers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Preserve your harvest with our modern cold storage facilities. Easy
            booking, competitive rates, and reliable service for farmers across
            the region.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Our Cold Storage?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Store Your Harvest?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers who trust us with their produce storage
            needs.
          </p>

          {!isAuthenticated && (
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Start Booking Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
