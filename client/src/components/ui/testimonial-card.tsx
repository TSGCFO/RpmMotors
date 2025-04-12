import { Card, CardContent } from "@/components/ui/card";
import { Testimonial } from "@shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { name, vehicle, rating, comment } = testimonial;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star"></i>);
    }

    if (halfStar) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <Card className="bg-white p-8 rounded-lg shadow-md">
      <CardContent className="p-0">
        <div className="flex text-[#E31837] mb-4">
          {renderStars(rating)}
        </div>
        <p className="italic text-gray-600 mb-6">
          "{comment}"
        </p>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center text-gray-500">
            <i className="fas fa-user text-xl"></i>
          </div>
          <div>
            <p className="font-['Poppins'] font-semibold">{name}</p>
            <p className="text-sm text-gray-500">{vehicle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
