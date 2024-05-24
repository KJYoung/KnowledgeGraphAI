# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class IncrementView(APIView):
    def post(self, request, *args, **kwargs):
        number = request.data.get('number')
        if number is not None:
            incremented_number = number + 10
            return Response({'result': incremented_number}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid input'}, status=status.HTTP_400_BAD_REQUEST)