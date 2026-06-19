<script setup lang="ts">
useSchemaOrg([
  {
    '@type': 'Organization',
    '@id': 'https://happytrip.vn/#organization',
    'name': 'Happy Trip',
    'url': 'https://happytrip.vn',
    'logo': 'https://happytrip.vn/images/logo.png',
    'telephone': '+84972970000',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Số 4, ngách 45, ngõ 218 Lĩnh Nam',
      'addressLocality': 'Hoàng Mai',
      'addressRegion': 'Hà Nội',
      'addressCountry': 'VN'
    },
    'sameAs': [
      'https://www.facebook.com/profile.php?id=61563838251812'
    ]
  },

  {
    '@type': 'TravelAgency',
    '@id': 'https://happytrip.vn/#business',
    'name': 'Happy Trip',
    'url': 'https://happytrip.vn',
    'telephone': '+84972970000',
    'areaServed': 'Việt Nam',
    'priceRange': '$$'
  },

  {
    '@type': 'WebSite',
    '@id': 'https://happytrip.vn/#website',
    'url': 'https://happytrip.vn',
    'name': 'Happy Trip',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://happytrip.vn/tim-kiem?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  },

  {
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Happy Trip cung cấp dịch vụ gì?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Happy Trip cung cấp dịch vụ xe riêng, xe tiện chuyến và đưa đón sân bay trên toàn quốc.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Làm sao để đặt xe Happy Trip?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Khách hàng có thể gọi hotline 0972 97 0000 hoặc đặt xe trực tiếp trên website happytrip.vn.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Happy Trip có hỗ trợ 24/7 không?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Đội ngũ tổng đài Happy Trip hỗ trợ khách hàng 24 giờ mỗi ngày, 7 ngày mỗi tuần.'
        }
      }
    ]
  }
])
</script>

<template>
  <Hero />
  <TrustMetrics />
  <About />
  <Articles class="mt-10" />
</template>
