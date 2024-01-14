from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import ListView, UpdateView

from core.pos.forms import AtributoForm
from core.pos.mixins import ValidatePermissionRequiredMixin
from core.pos.models import Atributos


class AtributosListView(ValidatePermissionRequiredMixin, ListView):
    model = Atributos
    template_name = 'atributo/list.html'
    permission_required = 'view_atributos'

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search':
                data = []
                for i in Atributos.objects.all():
                    data.append(i.toJSON())
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Listado de Atributos'
        context['create_url'] = reverse_lazy('product_create')
        context['list_url'] = reverse_lazy('product_list')
        context['entity'] = 'Atributos'
        return context


class AtributoUpdateView(ValidatePermissionRequiredMixin, UpdateView):
    model = Atributos
    form_class = AtributoForm
    template_name = 'atributo/create.html'
    success_url = reverse_lazy('atributos_list')
    url_redirect = success_url
    permission_required = 'change_atributo'

    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'edit':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Edición de un Atributos'
        context['entity'] = 'Atributo'
        context['list_url'] = self.success_url
        context['action'] = 'edit'
        return context
