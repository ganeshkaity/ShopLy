import { Heart, Star, Users, Leaf } from "lucide-react";
import { APP_NAME } from "@/constants";

export default function AboutPage() {
    return (
        <div className="flex flex-col gap-16 py-16">
            {/* Hero */}
            <section className="container-custom text-center space-y-6">
                <h1 className="font-serif text-5xl font-bold">Our Story</h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                    {APP_NAME} was born from a love of beautiful paper, thoughtful gifts, and the belief that every gesture of kindness deserves to be wrapped in something special.
                </p>
            </section>

            {/* Values */}
            <section className="container-custom">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: Heart, title: "Handcrafted with Love", desc: "Every item in our collection is selected or designed with care and attention to detail." },
                        { icon: Star, title: "Premium Quality", desc: "We source the finest materials to ensure our products feel as special as the moments they celebrate." },
                        { icon: Leaf, title: "Eco-Friendly", desc: "Sustainability matters. We use recycled and eco-conscious materials wherever possible." },
                        { icon: Users, title: "Community First", desc: "We support local artisans and small businesses, bringing you closer to the makers." },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="rounded-2xl bg-gray-50 p-8 text-center space-y-4 hover:shadow-md transition-shadow">
                            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{title}</h3>
                            <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission */}
            <section className="bg-secondary">
                <div className="container-custom py-16 text-center space-y-6">
                    <h2 className="font-serif text-4xl font-bold text-secondary-foreground">Our Mission</h2>
                    <p className="max-w-2xl mx-auto text-lg text-secondary-foreground/80 leading-relaxed">
                        To make gifting effortless and joyful by curating thoughtfully designed stationery and gift products that bring people closer together, one petal at a time.
                    </p>
                </div>
            </section>
        </div>
    );
}
