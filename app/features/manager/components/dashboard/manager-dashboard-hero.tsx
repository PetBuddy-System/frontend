import { useTranslation } from 'react-i18next'

export function ManagerDashboardHero() {
  const { t } = useTranslation('manager')

  return (
    <section className='flex flex-col gap-3'>
      <h1 className='flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-3xl font-extrabold tracking-tight text-primary md:text-5xl'>
        <span>{t('managerDashboard.hero.leading')}</span>
        <span>{t('managerDashboard.hero.middle')}</span>
        <span className='inline-flex h-10 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary/20 shadow-sm ring-2 ring-card md:h-11 md:w-20'>
          <img
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuD8FE4Zdc8tWzM6xi1hOjqR_r7UepkhtSDolWvvVVQD3CmQdOgRrbaqOqhQO5LhAkUKPHpNnP2uf5E8D3me8WNZS5fceEIH0BrKxll6fQwI069fVunFXQ9fuTJeTrD_YVNyL0OPp43wRskao5YAh5TD8JDrT6xFsk4yURijd1DheVaptCV1D0cjJA-wqrzw5JEy3tmeADiHuRzQpQcbNmRhWu01MCPOeinjdifFebT8jMZnURPHGjuqbVfm1ZyioyKZJoD1B8mPwNM'
            alt={t('managerDashboard.hero.dogAlt')}
            className='h-full w-full object-cover'
          />
        </span>
        <span>{t('managerDashboard.hero.trailing')}</span>
        <span className='inline-flex h-10 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 shadow-sm ring-2 ring-card md:h-11 md:w-20'>
          <img
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuC8N5AJrUbeK8XQVkHVpmNcwIOm-x64HYwscdliIs-qK-Y0OxRg_rmz3O1rwGStze2uJPEjnNxz8bg23BWgv9YOO_kt7DR823cNQDtf1MwyW8ZF75QWbdP6X_V0ysrtDliisoxdNG53U1aXoirtu3br8TAajlvfIqjS8-qoBstY3FHqJ4bzQPm_zia5Zo5OjLzWPzntZKcUYZIo1N3lRjb_B4DR0ov_h4ETKwR9V8opxVZadDraBjKhK1nn5wkNXN8J_gvVONnmoDs'
            alt={t('managerDashboard.hero.catAlt')}
            className='h-full w-full object-cover'
          />
        </span>
      </h1>
      <p className='max-w-3xl text-base text-muted-foreground md:text-lg'>
        {t('managerDashboard.hero.description')}
      </p>
    </section>
  )
}
