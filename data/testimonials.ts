export type Testimonial = {
  id: string; // stable slug
  quote: string; // verbatim quote text
  name: string; // attribution name
  role: string; // free-form attribution, e.g. "Lead Engineer, Acme"
};

// Real testimonials. The section stays gated off (TESTIMONIALS_ENABLED unset)
// until enabled in production.
export const testimonials: Testimonial[] = [
  {
    id: 'chiel-bleumink',
    quote:
      'Vond het een geweldige en leerzame training. Enorm veel dingen bijgeleerd die ik direct ook kan toepassen. En alleen maar meer motivatie gekregen om meer projecten op te pakken!',
    name: 'Chiel Bleumink',
    role: 'Senior Test Automation Engineer',
  },
  {
    id: 'bas-dijkstra',
    quote:
      'Heel leuke training, interessant en een heel prettige sfeer. Niet alleen als engineer iets geleerd, ook als trainer.',
    name: 'Bas Dijkstra',
    role: 'Senior Test Automation Engineer / Trainer',
  },
];
