from django.contrib import admin
from django.urls import path, include
from api.views import ApiRootView

urlpatterns = [
    path('', ApiRootView.as_view(), name='root-view'),
    path('api', ApiRootView.as_view(), name='api-bare-view'),
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
]

