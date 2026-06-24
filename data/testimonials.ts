export type Testimonial = {
  id: string; // stable slug
  quote: string; // verbatim quote text
  name: string; // attribution name
  role: string; // free-form attribution, e.g. "Lead Engineer, Acme"
};

// Placeholder content — the section stays gated off (TESTIMONIALS_ENABLED unset)
// until real testimonials replace these.
export const testimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    quote:
      'The training turned vague "use AI" guidance into a concrete workflow my team actually follows.',
    name: 'Placeholder Name',
    role: 'Engineering Lead, Example Co',
  },
  {
    id: 'placeholder-2',
    quote:
      'Hands-on from the first hour. We shipped a real change with agentic tooling by the end of day one.',
    name: 'Placeholder Name',
    role: 'Senior Engineer, Example BV',
  },
];
