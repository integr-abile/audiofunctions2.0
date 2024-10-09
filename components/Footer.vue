<template>
    <footer>
      <b-row>
        <b-col>
          <p class="text-center">
            &copy; {{ new Date().getFullYear() }} Audiofunctions. All rights
            reserved.
          </p>
          <p class="text-center">
            <NuxtLink to="/configure">Configure</NuxtLink> |
            <NuxtLink to="/instructions">Instructions</NuxtLink> |
            <NuxtLink to="/about">Who we are</NuxtLink>
          </p>
        </b-col>
      </b-row>
    </footer>
</template>