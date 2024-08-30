# TypeScript Website

This project is a TypeScript-based web application that allows users to navigate through and analyze leaf nodes of data. It features a responsive layout, dark mode support, and integration with AI services for processing article content.

## Main Components

### 1. MainLayout (MainLayout.tsx)

The `MainLayout` component serves as the primary structure of the application. It includes:

- Responsive sidebar (mobile and desktop versions)
- Header with controls
- Main content area
- Pagination
- Loading modal

Key features:
- Fetches and displays entries based on selected leaf node
- Manages state for dark mode, API provider selection, and pagination
- Handles article processing using OpenAI or Anthropic APIs

### 2. Sidebar (Sidebar.tsx)

The `Sidebar` component displays a list of leaf nodes and allows users to select them. It includes:

- Depth selector for navigating through different levels of leaf nodes
- Animated list of leaf nodes with percentage information
- Loading state with a custom loading animation

### 3. Header (Header.tsx)

The `Header` component contains various controls and input fields:

- Selected leaf node display
- Expand/Collapse all toggle
- Dark mode toggle
- API provider selection (OpenAI/Anthropic)
- Question input system for article processing
- JSON download button for processed results

### 4. MainContent (MainContent.tsx)

The `MainContent` component displays the entries for the selected leaf node:

- Card-based layout for each entry
- Expandable/collapsible full article view
- Display of AI-generated responses
- Support for dark mode

### 5. DepthSelector (DepthSelector.tsx)

The `DepthSelector` component allows users to navigate through different depths of leaf nodes. It includes:

- Chevron icons for increasing and decreasing depth
- Animated display of current depth and maximum depth
- Responsive design with mobile support

Key features:

- Uses react-responsive for mobile detection
- Implements Framer Motion for smooth animations
- Supports dark mode with appropriate color schemes
- Disables navigation buttons when at minimum or maximum depth

### 6. LoadingModal (LoadingModal.tsx)

The `LoadingModal` component displays a loading indicator and message when the application is processing data. It includes:

- Fullscreen overlay with semi-transparent background
- Centered loading spinner and message
- Support for dark mode

Key features:

- Uses Lucide React for the spinning loader icon
- Conditionally renders based on the `isOpen` prop
- Customizable loading message

### 7. Pagination (Pagination.tsx)

The `Pagination` component allows users to navigate through multiple pages of entries. It includes:

- Previous and Next buttons for page navigation
- Current page and total pages display
- Support for dark mode

Key features:

- Uses custom Button component for navigation controls
- Disables buttons when at the first or last page
- Adapts styling based on dark mode setting


## Key Features

1. **Responsive Design**: The application is fully responsive, with a collapsible sidebar for mobile devices.
2. **Dark Mode**: Users can toggle between light and dark modes for better readability.
3. **Depth Navigation**: Users can navigate through different depths of leaf nodes.
4. **AI Integration**: The application can process articles using either OpenAI or Anthropic APIs.
5. **Dynamic Question System**: Users can add, remove, and nest questions for article processing.
6. **Pagination**: Entries are paginated for better performance and user experience.
7. **JSON Export**: Processed results can be downloaded as a JSON file.

## Getting Started

1. Set up a .env.local with the following keys inside
```
ANTHROPIC_API_KEY="sk-***************************AA"

MONGODB_URI= "mongodb+srv://<User Name> :<Password>@<Data Base>.xm2fdvv.mongodb.net/"

Bayesian_OPENAI_API_KEY="sk-*******************************w2RIN"
```
2. Install Dependencies
```
npm install
```
3. Run it
```
npm run dev
```
## Contributing

Joseph Liu - josephliu1127@gmail.com - https://github.com/Ensyllis

## License

No License!
Private Property of Bayesian Capital Management