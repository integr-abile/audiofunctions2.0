<template>
  <b-navbar>
    <b-navbar-brand>
      <NuxtLink to="/">Audiofunctions</NuxtLink>
    </b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-nav-item>
        <NuxtLink to="/configure">Configuración</NuxtLink>
      </b-nav-item>
      <b-nav-item>
        <NuxtLink to="/instructions">Instrucciones de uso</NuxtLink>
      </b-nav-item>
      <b-nav-item>
        <NuxtLink to="/about">Quiénes somos</NuxtLink>
      </b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>
<style scoped lang="scss">
[aria-current="page"] {
  text-decoration: underline;
}
</style>
