export type Testimonial = {
  id: string; // stable slug
  quoteNL: string; // verbatim quote text
  quoteEN: string;
  name: string; // attribution name
  role: string; // free-form attribution, e.g. "Lead Engineer, Acme"
};

// Real testimonials. The section stays gated off (TESTIMONIALS_ENABLED unset)
// until enabled in production.
export const testimonials: Testimonial[] = [
  {
    id: 'chiel-bleumink',
    quoteNL:
      'Vond het een geweldige en leerzame training. Enorm veel dingen bijgeleerd die ik direct ook kan toepassen. En alleen maar meer motivatie gekregen om meer projecten op te pakken!',
    quoteEN:
      'It was a fantastic and educational training. I learned so many things that I can apply immediately. And I have only gained more motivation to take on more projects!',
    name: 'Chiel Bleumink',
    role: 'Senior Test Automation Engineer',
  },
  {
    id: 'bas-dijkstra',
    quoteNL:
      'Heel leuke training, interessant en een heel prettige sfeer. Niet alleen als engineer iets geleerd, ook als trainer.',
    quoteEN:
      'Very enjoyable training, interesting, and a great atmosphere. I learned something not only as an engineer, but also as a trainer.',
    name: 'Bas Dijkstra',
    role: 'Senior Test Automation Engineer / Trainer',
  },
];
