/** Editorial questions are prompts for the visitor, not conclusions about this property. */
export const NELSON_STORY = [
  {
    id: 'kitchen', pairIndex: 0, label: 'Kitchen · Layout', linkLabel: 'Explore the kitchen',
    beforeCaption: 'Before · Original kitchen', afterCaption: 'After · Completed kitchen',
    changed: 'The renovation moved the cooktop to a waterfall island with seating. Navy cabinetry and a statement hood give the finished kitchen a new focal point.',
    consider: 'How should cooking, seating, and circulation work together in your property?',
    beforeHeight: 999, afterHeight: 996,
  },
  {
    id: 'living', pairIndex: 2, label: 'Living spaces · Connection', linkLabel: 'Explore the living spaces',
    beforeCaption: 'Before · Original living room', afterCaption: 'After · Connected living spaces',
    changed: 'The photographs move from dark paneling and a dropped soffit to an open, staged living, dining, and kitchen area.',
    consider: 'Which spaces need to connect, and what would need to be checked before changing the layout?',
    beforeHeight: 999, afterHeight: 996,
  },
  {
    id: 'bath', pairIndex: 1, label: 'Primary bath · Scope', linkLabel: 'Explore the primary bath',
    beforeCaption: 'During construction · Primary bath', afterCaption: 'After · Completed primary bath',
    changed: 'The record begins with exposed framing and rough plumbing, then shows a freestanding tub, glass shower, and wood paneling.',
    consider: 'What work sits behind the finishes, and which scope, permit, and cost questions remain?',
    beforeHeight: 960, afterHeight: 767,
  },
] as const;
export function nelsonStory(value: string | null) {
  return NELSON_STORY.find(chapter => chapter.id === value) ?? NELSON_STORY[0];
}
export function nelsonStoryHref(id: string) {
  const chapter = nelsonStory(id);
  return `/projects/nelson-dr?from=home&story=${chapter.id}#nelson-${chapter.id}`;
}
