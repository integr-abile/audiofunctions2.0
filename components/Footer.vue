<template>
    <footer>
      <b-row>
        <b-col>
          <p class="text-center">
            &copy; {{ new Date().getFullYear() }} Audiofunctions. All rights
            reserved.
          </p>
          <p class="text-center">
            <!-- <NuxtLink to="/configure">Configura</NuxtLink> | -->
            <NuxtLink to="/instructions">Istruzioni</NuxtLink> |
            <NuxtLink to="/about">Chi siamo</NuxtLink>
          </p>
        </b-col>
      </b-row>
    </footer>
</template>