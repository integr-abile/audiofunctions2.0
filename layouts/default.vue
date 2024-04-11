<template>
  <div>
    <b-navbar>
      <b-navbar-brand>
        <NuxtLink to="/">Audiofunctions</NuxtLink>
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item>
          <NuxtLink to="/configure">Configura</NuxtLink>
        </b-nav-item>
        <b-nav-item>
          <NuxtLink to="/instructions">Istruzioni</NuxtLink>
        </b-nav-item>
        <b-nav-item>
          <NuxtLink to="/about">Chi siamo</NuxtLink>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <Nuxt />
  </div>
</template>
<style scoped lang="scss">
[aria-current="page"] {
  text-decoration: underline;
}
</style>
