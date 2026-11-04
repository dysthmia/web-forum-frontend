import { Route, Routes } from 'react-router'
import { PlaceholderPage } from '../../pages/PlaceholderPage.tsx'

const routes = [['/', 'Форум'], ['/categories', 'Категории'], ['/categories/:slug', 'Темы категории'], ['/topics/:id', 'Обсуждение'], ['/search', 'Поиск'], ['/users/:username', 'Профиль пользователя'], ['/login', 'Вход'], ['/register', 'Регистрация'], ['/topics/new', 'Новая тема'], ['/bookmarks', 'Избранное'], ['/settings', 'Настройки'], ['/moderation/reports', 'Жалобы'], ['/moderation/users', 'Блокировки пользователей'], ['/admin/categories', 'Управление категориями'], ['/admin/users', 'Управление пользователями']] as const

export function AppRouter() {
  return <Routes>{routes.map(([path, title]) => <Route key={path} path={path} element={<PlaceholderPage title={title} />} />)}<Route path="/403" element={<PlaceholderPage title="Доступ запрещён" description="У вас нет прав для просмотра этой страницы." />} /><Route path="*" element={<PlaceholderPage title="Страница не найдена" description="Проверьте адрес или вернитесь к списку тем." />} /></Routes>
}
