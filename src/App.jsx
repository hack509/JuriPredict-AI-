import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import AssistantPage from './pages/AssistantPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import RessourcesPage from './pages/RessourcesPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/assistant" element={<AssistantPage />} />
      <Route path="/connexion" element={<AuthPage />} />
      <Route path="/inscription" element={<AuthPage mode="register" />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/resultat" element={<ResultPage />} />
        <Route path="/base-juridique" element={<SearchPage />} />
        <Route path="/base-juridique/:id" element={<ArticlePage />} />
        <Route path="/ressources" element={<RessourcesPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}