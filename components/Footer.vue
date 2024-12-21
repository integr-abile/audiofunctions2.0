<template>
    <footer>
      <b-row>
        <b-col>
          <p class="text-center">
            &copy; {{ new Date().getFullYear() }} Audiofunctions. All rights
            reserved.
          </p>
          <p class="text-center">
            <NuxtLink to="/configure">Configuración</NuxtLink> |
            <NuxtLink to="/instructions">Instrucciones de uso</NuxtLink> |
            <NuxtLink to="/about">Quiénes somos</NuxtLink>
          </p>
        </b-col>
      </b-row>
    </footer>
</template>