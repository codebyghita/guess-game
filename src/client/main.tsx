import { Devvit } from '@devvit/public-api';
import GuessTheMemeGame from './components/GuessTheMemeGame.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type for the game
Devvit.addCustomPostType({
  name: 'Guess the Meme Game',
  description: 'Test your meme knowledge and solve word puzzles!',
  render: (context) => {
    return <GuessTheMemeGame />;
  },
});

// Add menu action to create the game post
Devvit.addMenuItem({
  label: 'Create Guess the Meme Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    
    try {
      const currentSubreddit = await reddit.getCurrentSubreddit();
      
      await reddit.submitPost({
        title: '🎯 Guess the Meme Challenge! Test Your Knowledge 🧠',
        subredditName: currentSubreddit.name,
        preview: (
          <vstack height="100%" width="100%" alignment="middle center">
            <text size="large" weight="bold">🎯 Guess the Meme Game!</text>
            <text size="medium" color="neutral-content-weak">
              Test your meme knowledge and solve word puzzles
            </text>
            <spacer />
            <text size="small" color="neutral-content">
              Click to start playing!
            </text>
          </vstack>
        ),
      });

      ui.showToast('Game post created successfully!');
    } catch (error) {
      console.error('Error creating game post:', error);
      ui.showToast('Failed to create game post. Please try again.');
    }
  },
});

export default Devvit;