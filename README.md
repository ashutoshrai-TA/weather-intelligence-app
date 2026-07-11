<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cc77aff0-3184-4014-ac46-b1d8df361b18

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Deployment Instructions:

1.Generated the app using Google AI Studio App Build.
2.Pushed the code directly to this GitHub repository.
3.Logged into Cloudflare Pages and connected this repository.
4.Set the Build Command to: npm run build
5.Set the Build Output Directory to: dist
6.Clicked Save and Deploy to launch the app.
