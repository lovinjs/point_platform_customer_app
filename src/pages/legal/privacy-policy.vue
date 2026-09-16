<template>
  <legal-document :document="privacyPolicyDocument" />
</template>

<script setup lang="ts">
import LegalDocument from '@/components/legal-document.vue'
import { privacyPolicyDocument } from '@/config/legal'
</script>
