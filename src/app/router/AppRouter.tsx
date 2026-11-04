import { Route, Routes } from 'react-router'
import { CategoriesPage } from '../../pages/CategoriesPage.tsx'
import { CategoryPage } from '../../pages/CategoryPage.tsx'
import { ForbiddenPage } from '../../pages/ForbiddenPage.tsx'
import { HomePage } from '../../pages/HomePage.tsx'
import { NotFoundPage } from '../../pages/NotFoundPage.tsx'
import { PlaceholderPage } from '../../pages/PlaceholderPage.tsx'
import { SearchPage } from '../../pages/SearchPage.tsx'
import { TopicPage } from '../../pages/TopicPage.tsx'
import { UserProfilePage } from '../../pages/UserProfilePage.tsx'
import { MainLayout } from '../../widgets/layout/MainLayout.tsx'

export function AppRouter() { return <Routes><Route element={<MainLayout />}><Route path="/" element={<HomePage />} /><Route path="/categories" element={<CategoriesPage />} /><Route path="/categories/:slug" element={<CategoryPage />} /><Route path="/topics/:id" element={<TopicPage />} /><Route path="/search" element={<SearchPage />} /><Route path="/users/:username" element={<UserProfilePage />} /><Route path="/topics/new" element={<PlaceholderPage title="Новая тема" />} /><Route path="/bookmarks" element={<PlaceholderPage title="Избранное" />} /><Route path="/settings" element={<PlaceholderPage title="Настройки" />} /><Route path="/moderation/reports" element={<PlaceholderPage title="Жалобы" />} /><Route path="/moderation/users" element={<PlaceholderPage title="Блокировки пользователей" />} /><Route path="/admin/categories" element={<PlaceholderPage title="Управление категориями" />} /><Route path="/admin/users" element={<PlaceholderPage title="Управление пользователями" />} /><Route path="/403" element={<ForbiddenPage />} /><Route path="*" element={<NotFoundPage />} /></Route><Route path="/login" element={<PlaceholderPage title="Вход" />} /><Route path="/register" element={<PlaceholderPage title="Регистрация" />} /></Routes> }
